import nested_admin
from django import forms
from django.contrib import admin
from django.contrib.admin.sites import AdminSite

from lessons.models import (
    Lesson,
    LessonChildAssignment,
    LessonClassAssignment,
    Test,
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestCheckboxVariant,
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


class TestQuestionElementInline(nested_admin.NestedTabularInline):
    model = TestQuestionElement
    extra = 0


class TestCheckboxVariantInline(nested_admin.NestedTabularInline):
    model = TestCheckboxVariant
    extra = 0


class TestCheckboxElementInline(nested_admin.NestedTabularInline):
    model = TestCheckboxElement
    inlines = [TestCheckboxVariantInline]
    extra = 0


@admin.register(Test)
class TestAdmin(nested_admin.NestedModelAdmin):  # Используем NestedModelAdmin
    list_display = ("id", "short_lesson", "short_name", "created_at", "updated_at")
    search_fields = ("lesson__name", "name", "lesson__teacher__last_name")
    show_facets = admin.ShowFacets.ALWAYS
    date_hierarchy = "created_at"
    inlines = [TestQuestionElementInline, TestCheckboxElementInline]

    @admin.display(description="Название")
    def short_name(self, obj):
        return obj.name[:20] + "..."

    @admin.display(description="Урок")
    def short_lesson(self, obj):
        return obj.lesson.name[:20] + "..." if obj.lesson else "-"


@admin.register(LessonClassAssignment)
class LessonClassAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "class_name", "lesson", "assigned_at", "deadline", "created_at", "updated_at")
    search_fields = ("class_name__name", "lesson__name", "lesson__teacher__last_name")
    list_filter = ("lesson__teacher__subject__name", "lesson__teacher__school__name")
    show_facets = admin.ShowFacets.ALWAYS


class TestQuestionAnswerInline(admin.TabularInline):
    model = TestQuestionAnswer
    extra = 0


class TestCheckboxAnswerInline(admin.TabularInline):
    model = TestCheckboxAnswer
    extra = 0


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
    inlines = [TestQuestionAnswerInline, TestCheckboxAnswerInline]

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
class TestQuestionAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "question", "answer", "is_correct", "created_at", "updated_at")
    search_fields = ("question__test__name", "question__question", "assignment__child__last_name")
    list_filter = ("is_correct",)
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child


class TestCheckboxVariantInline(admin.TabularInline):
    model = TestCheckboxVariant
    extra = 1


@admin.register(TestCheckboxElement)
class TestCheckboxElementAdmin(admin.ModelAdmin):
    list_display = ("id", "short_test", "short_question", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS
    inlines = [TestCheckboxVariantInline]

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Вопрос")
    def short_question(self, obj):
        return obj.question[:20] + "..."


class TestCheckboxAnswerForm(forms.ModelForm):
    class Meta:
        model = TestCheckboxAnswer
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, "question"):
            # Фильтруем варианты: только для текущего вопроса
            self.fields["answers"].queryset = TestCheckboxVariant.objects.filter(test_element=self.instance.question)


@admin.register(TestCheckboxAnswer)
class TestCheckboxAnswerAdmin(admin.ModelAdmin):
    form = TestCheckboxAnswerForm
    list_display = ("id", "child", "question", "all_answers", "points", "created_at", "updated_at")
    search_fields = ("question__test__name", "question__question", "assignment__child__last_name")
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    @admin.display(description="Ответы")
    def all_answers(self, obj):
        return ", ".join([answer.answer for answer in obj.answers.all()])

    @admin.display(description="Вопрос")
    def question(self, obj):
        return obj.question[:20] + "..."


# Для отладки, мб пригодится
# if settings.DEBUG:

#     @admin.register(TestCheckboxVariant)
#     class TestCheckboxVariantAdmin(admin.ModelAdmin):
#         list_display = ("id", "question", "short_answer", "is_correct", "points", "created_at", "updated_at")
#         search_fields = ("answer",)
#         date_hierarchy = "created_at"
#         show_facets = admin.ShowFacets.ALWAYS

#         @admin.display(description="Ответ")
#         def short_answer(self, obj):
#             return obj.answer[:20]

#         @admin.display(description="Вопрос")
#         def question(self, obj):
#             return obj.test_element.question[:20] + "..."
