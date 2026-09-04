import nested_admin
from django import forms
from django.conf import settings
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
    TestEssayAiAnswer,
    TestEssayAiElement,
    TestEssayAnswer,
    TestEssayElement,
    TestKeyValueAnswer,
    TestKeyValueElement,
    TestKeyVariant,
    TestQuestionAnswer,
    TestQuestionElement,
    TestValueVariant,
)
from users.models import Class, Teacher

AdminSite.empty_value_display = "-"


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "short_name", "created_at", "updated_at")
    search_fields = (
        "teacher__user__first_name",
        "teacher__user__last_name",
        "name",
        "teacher__subject__name",
        "teacher__school__name",
    )
    show_facets = admin.ShowFacets.ALWAYS
    list_filter = ("teacher__subject__name", "teacher__school__name")
    date_hierarchy = "created_at"

    @admin.display(description="Название")
    def short_name(self, obj):
        return obj.name[:20] + "..."

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "teacher" and not request.user.is_superuser:
            kwargs["queryset"] = Teacher.objects.filter(user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(teacher__user=request.user)


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


class TestValueVariantInline(nested_admin.NestedTabularInline):
    model = TestValueVariant
    extra = 0


class TestKeyVariantInline(nested_admin.NestedTabularInline):
    model = TestKeyVariant
    inlines = [TestValueVariantInline]
    extra = 0


class TestKeyValueElementInline(nested_admin.NestedTabularInline):
    model = TestKeyValueElement
    inlines = [TestKeyVariantInline]
    extra = 0


class TestEssayElementInline(nested_admin.NestedTabularInline):
    model = TestEssayElement
    extra = 0


class TestEssayAiElementInline(nested_admin.NestedTabularInline):
    model = TestEssayAiElement
    extra = 0


@admin.register(Test)
class TestAdmin(nested_admin.NestedModelAdmin):  # Используем NestedModelAdmin
    list_display = ("id", "short_lesson", "short_name", "created_at", "updated_at")
    search_fields = (
        "lesson__name",
        "name",
        "lesson__teacher__user__first_name",
        "lesson__teacher__user__last_name",
        "lesson__teacher__subject__name",
        "lesson__teacher__school__name",
    )
    show_facets = admin.ShowFacets.ALWAYS
    list_filter = ("lesson__teacher__subject__name", "lesson__teacher__school__name")
    date_hierarchy = "created_at"
    inlines = [
        TestQuestionElementInline,
        TestCheckboxElementInline,
        TestKeyValueElementInline,
        TestEssayElementInline,
        TestEssayAiElementInline,
    ]

    @admin.display(description="Название")
    def short_name(self, obj):
        return obj.name[:20] + "..."

    @admin.display(description="Урок")
    def short_lesson(self, obj):
        return obj.lesson.name[:20] + "..." if obj.lesson else "-"

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "lesson" and not request.user.is_superuser:
            kwargs["queryset"] = Lesson.objects.filter(teacher__user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(lesson__teacher__user=request.user)


@admin.register(LessonClassAssignment)
class LessonClassAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "class_name", "lesson", "deadline", "created_at", "updated_at")
    search_fields = (
        "class_name__name",
        "lesson__name",
        "lesson__teacher__user__first_name",
        "lesson__teacher__user__last_name",
    )
    list_filter = ("lesson__teacher__subject__name", "lesson__teacher__school__name")
    show_facets = admin.ShowFacets.ALWAYS
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(lesson__teacher__user=request.user)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if not request.user.is_superuser:
            if db_field.name == "lesson":
                kwargs["queryset"] = Lesson.objects.filter(teacher__user=request.user)
            elif db_field.name == "class_name":
                kwargs["queryset"] = Class.objects.filter(school__teachers__user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class TestQuestionAnswerInline(admin.TabularInline):
    model = TestQuestionAnswer
    extra = 0


class TestCheckboxAnswerInline(admin.TabularInline):
    model = TestCheckboxAnswer
    extra = 0


class TestKeyValueAnswerInline(admin.TabularInline):
    model = TestKeyValueAnswer
    extra = 0


class TestEssayAnswerInline(admin.TabularInline):
    model = TestEssayAnswer
    extra = 0


@admin.register(LessonChildAssignment)
class LessonChildAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "child",
        "class_assignment",
        "score",
        "completed_at",
        "deadline",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "child__last_name",
        "class_assignment__class_name__name",
        "class_assignment__lesson__name",
        "class_assignment__lesson__teacher__user__last_name",
        "class_assignment__lesson__teacher__user__first_name",
    )
    list_filter = (
        "class_assignment__lesson__teacher__subject__name",
        "class_assignment__lesson__teacher__school__name",
    )
    show_facets = admin.ShowFacets.ALWAYS
    inlines = [TestQuestionAnswerInline, TestCheckboxAnswerInline, TestKeyValueAnswerInline, TestEssayAnswerInline]
    date_hierarchy = "created_at"

    @admin.display(description="Дедлайн")
    def deadline(self, obj):
        return obj.class_assignment.deadline

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        if request.user.is_teacher:
            return super().get_queryset(request).filter(class_assignment__lesson__teacher__user=request.user)


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

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(test__lesson__teacher__user=request.user)


@admin.register(TestQuestionAnswer)
class TestQuestionAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "question", "answer", "points", "created_at", "updated_at")
    search_fields = ("question__test__name", "question__question", "assignment__child__last_name")
    list_filter = ("question__test__lesson__teacher__subject__name",)
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(question__test__lesson__teacher__user=request.user)


class TestCheckboxVariantInline(admin.TabularInline):
    model = TestCheckboxVariant
    extra = 1


@admin.register(TestCheckboxElement)
class TestCheckboxElementAdmin(admin.ModelAdmin):
    list_display = ("id", "short_test", "short_question", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"
    inlines = [TestCheckboxVariantInline]

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Вопрос")
    def short_question(self, obj):
        return obj.question[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(test__lesson__teacher__user=request.user)


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

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    @admin.display(description="Ответы")
    def all_answers(self, obj):
        return ", ".join([answer.answer for answer in obj.answers.all()])

    @admin.display(description="Вопрос")
    def question(self, obj):
        return obj.question[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(question__test__lesson__teacher__user=request.user)


class TestKeyValueAnswerForm(forms.ModelForm):
    class Meta:
        model = TestKeyValueAnswer
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, "question"):
            # Фильтруем варианты: только для текущего вопроса
            self.fields["answers"].queryset = TestKeyVariant.objects.filter(test_element=self.instance.question)


@admin.register(TestKeyValueAnswer)
class TestKeyValueAnswerAdmin(admin.ModelAdmin):
    form = TestKeyValueAnswerForm
    list_display = ("id", "child", "question", "assignment", "points", "created_at", "updated_at")
    date_hierarchy = "created_at"

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    @admin.display(description="Вопрос")
    def question(self, obj):
        return obj.question[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(question__test__lesson__teacher__user=request.user)


@admin.register(TestKeyValueElement)
class TestKeyValueElementAdmin(nested_admin.NestedModelAdmin):
    list_display = ("id", "short_test", "short_description", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"
    inlines = [TestKeyVariantInline]

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Описание")
    def short_description(self, obj):
        return obj.description[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(test__lesson__teacher__user=request.user)


@admin.register(TestEssayElement)
class TestEssayElementAdmin(admin.ModelAdmin):
    list_display = ("id", "short_test", "short_question", "points", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Вопрос")
    def short_question(self, obj):
        return obj.question[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(test__lesson__teacher__user=request.user)


@admin.register(TestEssayAnswer)
class TestEssayAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "class_number", "is_verified", "question", "points", "created_at", "updated_at")
    search_fields = (
        "question__test__name",
        "question__question",
        "assignment__child__first_name",
        "assignment__child__last_name",
    )
    date_hierarchy = "created_at"
    list_filter = ("is_verified",)
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    @admin.display(description="Класс")
    def class_number(self, obj):
        return obj.assignment.child.class_number

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(question__test__lesson__teacher__user=request.user)


@admin.register(TestEssayAiElement)
class TestEssayAiElementAdmin(admin.ModelAdmin):
    list_display = ("id", "short_test", "short_question", "points", "created_at", "updated_at")
    search_fields = ("test__name",)
    date_hierarchy = "created_at"

    @admin.display(description="Тест")
    def short_test(self, obj):
        return obj.test.name[:20] + "..."

    @admin.display(description="Вопрос")
    def short_question(self, obj):
        return obj.question[:20] + "..."

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(test__lesson__teacher__user=request.user)


@admin.register(TestEssayAiAnswer)
class TestEssayAiAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "question", "points", "created_at", "updated_at")
    search_fields = ("question__test__name", "question__question", "assignment__child__last_name")
    date_hierarchy = "created_at"
    show_facets = admin.ShowFacets.ALWAYS

    @admin.display(description="Ребенок")
    def child(self, obj):
        return obj.assignment.child

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        return super().get_queryset(request).filter(question__test__lesson__teacher__user=request.user)


# Для отладки, мб пригодится
if settings.DEBUG:

    @admin.register(TestCheckboxVariant)
    class TestCheckboxVariantAdmin(admin.ModelAdmin):
        list_display = ("id", "question", "short_answer", "is_correct", "points")
        search_fields = ("answer",)
        date_hierarchy = "test_element__created_at"
        show_facets = admin.ShowFacets.ALWAYS

        @admin.display(description="Ответ")
        def short_answer(self, obj):
            return obj.answer[:20]

        @admin.display(description="Вопрос")
        def question(self, obj):
            return obj.test_element.question[:20] + "..."
