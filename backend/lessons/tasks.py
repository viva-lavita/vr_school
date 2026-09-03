import logging

from celery import shared_task
from django.db import transaction
from django.db.models import Sum

from lessons.models import (
    LessonChildAssignment,
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestEssayAiAnswer,
    TestEssayAnswer,
    TestEssayElement,
    TestKeyValueAnswer,
    TestKeyValueElement,
    TestQuestionAnswer,
    TestQuestionElement,
)
from lessons.utils import evaluate_essay

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

        max_score = assignment.class_assignment.get_max_score()
        grade = assignment.class_assignment.get_grade(total_points) if max_score > 0 else 0

        assignment.score = grade
        if not assignment.completed_at:
            assignment.completed_at = assignment.updated_at
        assignment.save(update_fields=["score", "completed_at"])

        count_processed += 1

    logger.info(f"Finished score recalculation run. Processed {count_processed} assignments.")


@shared_task(bind=True, max_retries=3)
def evaluate_essay_with_ai(self, answer_id: int):
    """Проверка эссе с помощью AI."""
    try:
        answer = TestEssayAiAnswer.objects.select_related(
            "question",
            "assignment__child__class_number",  # ForeignKey(Class)
        ).get(pk=answer_id)
    except TestEssayAiAnswer.DoesNotExist:
        return

    question = answer.question
    child = answer.assignment.child
    class_obj = child.class_number  # это объект Class

    class_label = getattr(class_obj, "name", str(class_obj))  # например, "5А"

    essay_text = answer.answer
    mention_things = question.mention_things
    max_points = question.points

    try:
        points = evaluate_essay(essay_text, class_label, mention_things, max_points)
    except Exception as exc:
        logger.exception("Ошибка при оценке эссе answer_id=%s", answer_id)
        raise self.retry(exc=exc, countdown=60)

    with transaction.atomic():
        answer.points = points
        answer.save(update_fields=["points", "updated_at"])

    return {"answer_id": answer_id, "points": points}
