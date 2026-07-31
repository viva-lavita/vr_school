from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from lessons.models import (
    LessonChildAssignment,
    LessonClassAssignment,
)
from users.models import Child


@receiver(post_save, sender=LessonClassAssignment)
def create_user_assignments(sender, instance, created, **kwargs):
    """Автоматическое создание назначений урока у учеников, при создания назначения классу."""
    if created:
        students = Child.objects.filter(class_number=instance.class_name)
        user_assignments = [LessonChildAssignment(child=student, class_assignment=instance) for student in students]
        LessonChildAssignment.objects.bulk_create(user_assignments)


# @receiver(post_save, sender=LessonClassAssignment)
# def max_score_update(sender, instance, created, **kwargs):
#     """Подсчет максимально возможного количества баллов по тесту."""
#     if created:
#         lesson = instance.lesson
#         test = Test.objects.filter(lesson=lesson).all()
#         max_score = 0
#         for t in test:
#             test_q_elements = TestQuestionElement.objects.filter(test=t).all()
#             for el in test_q_elements:
#                 max_score += el.points

#             test_checkbox_elements = TestCheckboxElement.objects.filter(test=t).all()
#             for el in test_checkbox_elements:
#                 for variant in el.variants.all():
#                     max_score += variant.points if variant.points > 0 else 0

#             test_key_value_elements = TestKeyValueElement.objects.filter(test=t).all()
#             for el in test_key_value_elements:
#                 for key in el.keys.all():
#                     max_score += key.points

#             test_essay_elements = TestEssayElement.objects.filter(test=t).all()
#             for el in test_essay_elements:
#                 max_score += el.points

#         instance.max_score = max_score
#         instance.save()


@receiver(post_save, sender=LessonChildAssignment)
def completed_at_update(sender, instance, created, **kwargs):
    """
    Обновление даты завершения урока у ученика, если уроку проставлена оценка.
    """
    if instance.score is not None and instance.completed_at is None:
        instance.completed_at = timezone.now()
        instance.save()
