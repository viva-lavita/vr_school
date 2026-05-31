from django.contrib import admin
from django.contrib.admin.sites import AdminSite

from lessons.models import (
    Lesson,
    LessonChildAssignment,
    LessonClassAssignment,
    Test,
    TestQuestionAnswer,
    TestQuestionElement,
)

AdminSite.empty_value_display = "-"


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "short_name", "created_at", "updated_at")
    search_fields = ("teacher__last_name", "name")
    show_facets = admin.ShowFacets.ALWAYS
    list_filter = ("teacher__subject__name", "teacher__school__name")
    date_hierarchy = "created_at"

    @admin.display(description="Название")
    def short_name(self, obj):
        return obj.name[:20] + "..."


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ("id", "short_lesson", "short_name", "created_at", "updated_at")
    search_fields = ("lesson__name", "name", "lesson__teacher__last_name")
    show_facets = admin.ShowFacets.ALWAYS
    date_hierarchy = "created_at"

    @admin.display(description="Название")
    def short_name(self, obj):
        return obj.name[:20] + "..."

    @admin.display(description="Урок")
    def short_lesson(self, obj):
        return obj.lesson.name[:20] + "..."


@admin.register(LessonClassAssignment)
class LessonClassAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "class_name", "lesson", "assigned_at", "deadline", "created_at", "updated_at")
    search_fields = ("class_name__name", "lesson__name", "lesson__teacher__last_name")
    list_filter = ("lesson__teacher__subject__name", "lesson__teacher__school__name")
    show_facets = admin.ShowFacets.ALWAYS


class TestQuestionAnswerInline(admin.TabularInline):
    model = TestQuestionAnswer
    extra = 1


@admin.register(LessonChildAssignment)
class LessonChildAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "child",
        "class_assignment",
        "score",
        "assigned_at",
        "completed_at",
        "deadline",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "child__last_name",
        "class_assignment__class_name__name",
        "class_assignment__lesson__name",
        "class_assignment__lesson__teacher__last_name",
    )
    list_filter = (
        "class_assignment__lesson__teacher__subject__name",
        "class_assignment__lesson__teacher__school__name",
    )
    show_facets = admin.ShowFacets.ALWAYS
    inlines = [TestQuestionAnswerInline]

    @admin.display(description="Дедлайн")
    def deadline(self, obj):
        return obj.class_assignment.deadline

    @admin.display(description="Назначен")
    def assigned_at(self, obj):
        return obj.class_assignment.assigned_at


@admin.register(TestQuestionElement)
class TestQuestionElementAdmin(admin.ModelAdmin):
    list_display = ("id", "short_test", "short_question", "points", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Вопрос")
    def short_question(self, obj):
        return obj.question[:20] + "..."


@admin.register(TestQuestionAnswer)
class TestQuestionAnswerAdmin(admin.ModelAdmin):  # TODO: добавить имя ребенка в поля отображения
    list_display = ("id", "child", "question", "answer", "is_correct", "created_at", "updated_at")
    search_fields = ("question__test__name", "question__question", "assignment__user__last_name")
    list_filter = ("is_correct",)
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child
