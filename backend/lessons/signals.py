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


@receiver(post_save, sender=LessonChildAssignment)
def completed_at_update(sender, instance, created, **kwargs):
    """
    Обновление даты завершения урока у ученика, если уроку проставлена оценка.
    """
    if instance.score is not None and instance.completed_at is None:
        instance.completed_at = timezone.now()
        instance.save()


@receiver(post_save, sender=Child)
def create_assignments_for_new_child(sender, instance, **kwargs):
    """Создание назначений уроков для ребёнка, добавленного в класс после назначения урока."""
    if instance.class_number:
        existing = LessonChildAssignment.objects.filter(child=instance).values_list("class_assignment", flat=True)
        assignments = LessonClassAssignment.objects.filter(class_name=instance.class_number).exclude(pk__in=existing)
        LessonChildAssignment.objects.bulk_create(
            [LessonChildAssignment(child=instance, class_assignment=a) for a in assignments]
        )
