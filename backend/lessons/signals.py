from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from lessons.models import LessonChildAssignment, LessonClassAssignment
from users.models import Child


@receiver(post_save, sender=LessonClassAssignment)
def create_user_assignments(sender, instance, created, **kwargs):
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
