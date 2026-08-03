import logging

from celery import shared_task
from django.db.models import Sum

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

    assignments = LessonChildAssignment.objects.filter(score__isnull=True)
    count_processed = 0

    for assignment in assignments:
        lesson = assignment.class_assignment.lesson

        # Считаем ожидаемое количество заданий каждого типа в уроке
        expected_questions = TestQuestionElement.objects.filter(test__lesson=lesson).count()
        expected_checkboxes = TestCheckboxElement.objects.filter(test__lesson=lesson).count()
        expected_key_value = TestKeyValueElement.objects.filter(test__lesson=lesson).count()
        expected_essays = TestEssayElement.objects.filter(test__lesson=lesson).count()

        # Считаем, сколько реально сделано учеником
        done_questions = TestQuestionAnswer.objects.filter(assignment=assignment).count()
        done_checkboxes = TestCheckboxAnswer.objects.filter(assignment=assignment).count()
        done_key_value = TestKeyValueAnswer.objects.filter(assignment=assignment).count()
        done_essays = TestEssayAnswer.objects.filter(
            assignment=assignment,
            is_verified=True,
        ).count()

        # Проверка: все ли задания выполнены
        if not (
            done_questions == expected_questions
            and done_checkboxes == expected_checkboxes
            and done_key_value == expected_key_value
            and done_essays == expected_essays
        ):
            continue

        logger.info(f"Recalculating score for {assignment}")

        # Подсчёт баллов
        q_points = TestQuestionAnswer.objects.filter(assignment=assignment).aggregate(total=Sum("points"))["total"] or 0
        cb_points = (
            TestCheckboxAnswer.objects.filter(assignment=assignment).aggregate(total=Sum("points"))["total"] or 0
        )
        kv_points = (
            TestKeyValueAnswer.objects.filter(assignment=assignment).aggregate(total=Sum("points"))["total"] or 0
        )
        essay_points = (
            TestEssayAnswer.objects.filter(assignment=assignment, is_verified=True).aggregate(total=Sum("points"))[
                "total"
            ]
            or 0
        )

        total_points = q_points + cb_points + kv_points + essay_points

        max_score = assignment.get_max_score()
        grade = assignment.get_grade(total_points) if max_score > 0 else 0

        assignment.score = grade
        if not assignment.completed_at:
            assignment.completed_at = assignment.updated_at
        assignment.save(update_fields=["score", "completed_at"])

        count_processed += 1

    logger.info(f"Finished score recalculation run. Processed {count_processed} assignments.")
