from django.contrib.auth import get_user_model
from django.db import models

from users.models import Child, Class, Teacher

User = get_user_model()

# TODO: блок домашнее задание - Яндекс формы или AI генерация и т.д. отрисовка на фронте.
# TODO: Комментарии к уроку - переписка между учителем и учеником (вывод комментариев только по этому ученику).
# Вопрос: в формате чата или подойдет в формате комментарий от ученика - ответ от преподавателя.
# Если простые комментарии, то будет обычная фильтрация по ученику (ответы учителя будут привязаны к комментарию от ученика). Две таблицы (комментарий и ответ на комментарий).
# Если чат, то должна быть дополнительная таблица М2М (пользователь, урок) к которой будут привязываться комментарии преподавателя и юзера.
# В админке тогда будет сложная схема назначения уроков, создание экземпляров прямо в коде админки?


class Lesson(models.Model):
    """Урок."""

    name = models.CharField(max_length=255, verbose_name="Название урока")
    description = models.TextField(blank=True, verbose_name="Описание")
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="lessons", verbose_name="Преподаватель")
    video = models.URLField(blank=True, verbose_name="Ссылка на видео")
    sub_description = models.TextField(blank=True, verbose_name="Дополнительное описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Урок"
        verbose_name_plural = "Уроки"
        ordering = ["name"]

    def __str__(self):
        return self.name[:20]


class Test(models.Model):
    """Тест."""

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="tests", verbose_name="Урок")
    name = models.CharField(max_length=255, verbose_name="Название теста")
    description = models.TextField(blank=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name[:20]


class LessonClassAssignment(models.Model):
    """
    Назначение урока ученику.
    """

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="assignments", verbose_name="Урок")
    class_name = models.ForeignKey(Class, on_delete=models.PROTECT, related_name="assignments", verbose_name="Класс")
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name=("Назначен"))
    deadline = models.DateTimeField(null=True, blank=True, verbose_name=("Дедлайн"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Назначение урока классу"
        verbose_name_plural = "Назначения уроков классам"
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["lesson", "class_name"], name="unique_class_assignment")]

    def __str__(self):
        return f"Класс {self.class_name}, урок: {self.lesson.name[:20]}"


class LessonChildAssignment(models.Model):
    """
    Назначение урока ученику.
    """

    child = models.ForeignKey(Child, on_delete=models.PROTECT, related_name="assignments", verbose_name="Ученик")
    class_assignment = models.ForeignKey(
        LessonClassAssignment,
        on_delete=models.PROTECT,
        related_name="assignments",
        verbose_name="Назначение урока классу",
    )
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=("Завершен"))
    score = models.SmallIntegerField(null=True, blank=True, verbose_name=("Оценка"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Назначение урока ученику"
        verbose_name_plural = "Назначения уроков ученикам"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.child}, урок {self.class_assignment.lesson.name[:20]}"


class TestQuestionElement(models.Model):
    """ "
    Элемент теста.

    Тип: вопрос, где ответ - пустое поле заполняемое учеником.
    """

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions", verbose_name="Тест")
    question = models.TextField(verbose_name="Вопрос")
    answer = models.CharField(max_length=255, verbose_name="Верный ответ")
    points = models.SmallIntegerField(verbose_name="Балл")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: вопрос с пустым полем ответа"
        verbose_name_plural = "Элементы теста: вопросы с пустым полем ответа"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test.name[:20]} - {self.question[:20]}"


class TestQuestionAnswer(models.Model):
    """Ответ на тест."""

    question = models.ForeignKey(
        TestQuestionElement, related_name="answers", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    assignment = models.ForeignKey(
        LessonChildAssignment, related_name="answersQuestion", on_delete=models.CASCADE, verbose_name="Назначение урока"
    )
    answer = models.CharField(max_length=255, verbose_name="Ответ")
    is_correct = models.BooleanField(default=False, verbose_name="Правильно")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Ответ ученика: вопрос с пустым полем ответа"
        verbose_name_plural = "Ответы учеников: вопросы с пустым полем ответа"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Ответ ученика {self.assignment.child.first_name} {self.assignment.child.last_name} к вопросу {self.question.question[:20]}"


class TestCheckboxElement(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="checkboxes", verbose_name="Тест")
    question = models.CharField(max_length=255, verbose_name="Вопрос")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: вопрос с чекбоксами"
        verbose_name_plural = "Элементы теста: вопросы с чекбоксами"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test.name[:20]} - {self.question[:20]}"


class TestCheckboxVariant(models.Model):
    test_element = models.ForeignKey(
        TestCheckboxElement, related_name="variants", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    answer = models.CharField(max_length=80, verbose_name="Ответ")
    points = models.SmallIntegerField(verbose_name="Балл")
    is_correct = models.BooleanField(default=False, verbose_name="Правильно")
    # TODO: Поля ниже можно удалить
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: варианты для вопроса с чекбоксами"
        verbose_name_plural = "Элементы теста: варианты для вопросов с чекбоксами"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test_element.question[:20]} - {self.answer[:20]}"


class TestCheckboxAnswer(models.Model):
    question = models.ForeignKey(
        TestCheckboxElement, related_name="answers", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    assignment = models.ForeignKey(
        LessonChildAssignment, related_name="answersCheckbox", on_delete=models.CASCADE, verbose_name="Назначение урока"
    )
    points = models.SmallIntegerField(default=0, verbose_name="Полученные баллы")
    answers = models.ManyToManyField(TestCheckboxVariant, verbose_name="Ответы")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Ответ ученика: вопрос с чекбоксами"
        verbose_name_plural = "Ответы учеников: вопросы с чекбоксами"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.question.question[:20]} - {self.answers}"
