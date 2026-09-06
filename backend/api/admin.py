from django.contrib import admin
from django_celery_beat.models import ClockedSchedule, CrontabSchedule, IntervalSchedule, PeriodicTask, SolarSchedule

from api.models import ContactMessage

admin.site.unregister(PeriodicTask)
admin.site.unregister(IntervalSchedule)
admin.site.unregister(CrontabSchedule)
admin.site.unregister(SolarSchedule)
admin.site.unregister(ClockedSchedule)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "accepted_policy", "created_at")
    list_filter = ("accepted_policy", "created_at")
    search_fields = ("name", "email", "phone")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
