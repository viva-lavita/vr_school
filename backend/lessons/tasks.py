import logging

from celery import shared_task

from lessons.models import (
    LessonChildAssignment,
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestEssayAnswer,
    TestEssayElement,
    TestKeyValueAnswer,
    TestKeyValueElement,
    TestQuestionAnswer,
    TestQuestionElement,
)

logger = logging.getLogger("tasks")


@shared_task
def recalculate_missing_scores():
    """
    Раз в 3 часа: для всех LessonChildAssignment без score проверяет,
    выполнены ли все типы заданий теста. Если да — считает баллы и ставит оценку.
    """
    logger.info("Starting score recalculation run")
    # Получаем все назначения без оценки
    assignments = LessonChildAssignment.objects.filter(score__isnull=True)

    for assignment in assignments:
        lesson = assignment.class_assignment.lesson

        # Проверяем, что все типы заданий завершены
        all_questions_done = (
            TestQuestionAnswer.objects.filter(assignment=assignment).count()
            == TestQuestionElement.objects.filter(test__lesson=lesson).count()
        )

        all_checkboxes_done = (
            TestCheckboxAnswer.objects.filter(assignment=assignment).count()
            == TestCheckboxElement.objects.filter(test__lesson=lesson).count()
        )

        all_key_value_done = (
            TestKeyValueAnswer.objects.filter(assignment=assignment).count()
            == TestKeyValueElement.objects.filter(test__lesson=lesson).count()
        )

        all_essays_done = (
            TestEssayAnswer.objects.filter(
                assignment=assignment,
                is_verified=True,  # эссе считаются выполненными только после проверки
            ).count()
            == TestEssayElement.objects.filter(test__lesson=lesson).count()
        )

        if not (all_questions_done and all_checkboxes_done and all_key_value_done and all_essays_done):
            continue  # не все задания сделаны — пропускаем

        logger.info(f"Recalculating score for {assignment}")

        # Считаем суммарный балл
        total_points = 0

        # Вопросы с пустым полем
        q_points = (
            TestQuestionAnswer.objects.filter(assignment=assignment).aggregate(
                total=__import__("django.db.models").Sum("points")
            )["total"]
            or 0
        )
        total_points += q_points

        # Чекбоксы
        cb_points = (
            TestCheckboxAnswer.objects.filter(assignment=assignment).aggregate(
                total=__import__("django.db.models").Sum("points")
            )["total"]
            or 0
        )
        total_points += cb_points

        # Ключ-значение
        kv_points = (
            TestKeyValueAnswer.objects.filter(assignment=assignment).aggregate(
                total=__import__("django.db.models").Sum("points")
            )["total"]
            or 0
        )
        total_points += kv_points

        # Эссе (только проверенные)
        essay_points = (
            TestEssayAnswer.objects.filter(assignment=assignment, is_verified=True).aggregate(
                total=__import__("django.db.models").Sum("points")
            )["total"]
            or 0
        )
        total_points += essay_points

        # Получаем максимальный балл урока
        max_score = assignment.get_max_score()

        # Ставим оценку
        grade = assignment.get_grade(total_points) if max_score > 0 else 0

        assignment.score = grade
        assignment.completed_at = assignment.updated_at  # можно поставить текущее время
        assignment.save(update_fields=["score", "completed_at"])

    logger.info("Finished score recalculation run")
