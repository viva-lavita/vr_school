from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import User


@receiver(post_save, sender=User)
def assign_teacher_group(sender, instance, **kwargs):
    if instance.is_teacher:
        teachers_group, _ = Group.objects.get_or_create(name="Учителя")

        if not instance.groups.filter(pk=teachers_group.pk).exists():
            instance.groups.add(teachers_group)
            print("Added teacher group to user")

        if not instance.is_staff:
            User.objects.filter(pk=instance.pk).update(is_staff=True)
            instance.is_staff = True

    else:
        teachers_group = Group.objects.filter(name="Учителя").first()
        if teachers_group and instance.groups.filter(pk=teachers_group.pk).exists():
            instance.groups.remove(teachers_group)
            print("Removed teacher group from user")
