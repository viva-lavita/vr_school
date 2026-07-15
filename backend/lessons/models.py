from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

from users.models import Child, Class, Teacher

User = get_user_model()


class Lesson(models.Model):
    """Урок."""

    name = models.CharField(max_length=255, verbose_name="Название урока")
    description = models.TextField(blank=True, verbose_name="Описание")
    is_need_vpn = models.BooleanField(default=False, verbose_name="Требуется VPN")
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
    Назначение урока классу.
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

    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="assignments", verbose_name="Ученик")
    class_assignment = models.ForeignKey(
        LessonClassAssignment,
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name="Назначение урока классу",
    )
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=("Завершен"))
    in_progress = models.BooleanField(default=False, verbose_name=("В процессе прохождения"))
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
    answer = models.CharField(max_length=20, verbose_name="Верный ответ")
    points = models.SmallIntegerField(default=1, verbose_name="Балл")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: вопрос с пустым полем ответа"
        verbose_name_plural = "Элементы теста: вопросы с пустым полем ответа"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test.name[:20]} - {self.question[:20]}"

    def save(self, *args, **kwargs):
        self.answer = self.answer.lower()
        super().save(*args, **kwargs)


class TestQuestionAnswer(models.Model):
    """Ответ на тест."""

    question = models.ForeignKey(
        TestQuestionElement, related_name="answers", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    assignment = models.ForeignKey(
        LessonChildAssignment, related_name="answersQuestion", on_delete=models.CASCADE, verbose_name="Назначение урока"
    )
    answer = models.CharField(max_length=20, verbose_name="Ответ")
    points = models.SmallIntegerField(default=0, verbose_name="Полученные баллы")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Ответ ученика: вопрос с пустым полем ответа"
        verbose_name_plural = "Ответы учеников: вопросы с пустым полем ответа"
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["question", "assignment"], name="unique_question_answer")]

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

    class Meta:
        verbose_name = "Вариант элемента теста: варианты для вопроса с чекбоксами"
        verbose_name_plural = "Варианты элементов теста: варианты для вопросов с чекбоксами"
        ordering = ["-test_element"]

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
        constraints = [models.UniqueConstraint(fields=["question", "assignment"], name="unique_checkbox_answer")]

    def __str__(self):
        return f"{self.question.question[:20]} - {self.answers}"


class TestKeyValueElement(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="key_value", verbose_name="Тест")
    description = models.CharField(max_length=255, verbose_name="Вопрос")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: вопрос с ключом и значением"
        verbose_name_plural = "Элементы теста: вопросы с ключом и значением"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test.name[:20]} - {self.description[:20]}"


class TestKeyVariant(models.Model):
    """Элементы для сопоставления, ключ."""

    test_element = models.ForeignKey(
        TestKeyValueElement, related_name="keys", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    key = models.CharField(max_length=255, verbose_name="Ключ")
    points = models.SmallIntegerField(default=0, verbose_name="Балл")

    class Meta:
        verbose_name = "Ключ"
        verbose_name_plural = "Ключи"
        ordering = ["key"]

    def __str__(self):
        return f"{self.test_element.description[:20]} - {self.key[:20]}"


class TestValueVariant(models.Model):
    """Элементы для сопоставления, значения."""

    key = models.ForeignKey(TestKeyVariant, related_name="values", on_delete=models.CASCADE, verbose_name="Ключ")
    value = models.CharField(max_length=255, verbose_name="Значение")

    class Meta:
        verbose_name = "Значение"
        verbose_name_plural = "Значения"
        ordering = ["key", "value"]

    def __str__(self):
        return f"{self.key.key[:20]} - {self.value[:20]}"


class TestKeyValueAnswer(models.Model):
    question = models.ForeignKey(
        TestKeyValueElement, related_name="answers", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    assignment = models.ForeignKey(
        LessonChildAssignment, related_name="answersKeyValue", on_delete=models.CASCADE, verbose_name="Назначение урока"
    )
    points = models.SmallIntegerField(default=0, verbose_name="Полученные баллы")
    answers = models.JSONField(verbose_name="Ответы")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Ответ ученика: вопрос с ключом и значением"
        verbose_name_plural = "Ответы учеников: вопросы с ключом и значением"
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["question", "assignment"], name="unique_key_value_answer")]

    def __str__(self):
        return f"{self.question.description[:20]} - {self.answers}"


class TestEssayElement(models.Model):
    """Элемент теста: эссе. Проверка преподавателем."""

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="essays", verbose_name="Тест")
    question = models.CharField(max_length=1000, verbose_name="Вопрос")
    points = models.SmallIntegerField(verbose_name="Максимальное количество баллов")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Элемент теста: эссе"
        verbose_name_plural = "Элементы теста: эссе"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.test.name[:20]} - {self.question[:20]}"


class TestEssayAnswer(models.Model):
    """Ответ ученика на эссе."""

    question = models.ForeignKey(
        TestEssayElement, related_name="answers", on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    assignment = models.ForeignKey(
        LessonChildAssignment, related_name="answersEssay", on_delete=models.CASCADE, verbose_name="Назначение урока"
    )
    points = models.SmallIntegerField(default=0, verbose_name="Полученные баллы")
    answer = models.TextField(verbose_name="Ответ")
    is_verified = models.BooleanField(default=False, verbose_name="Проверен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Ответ ученика: эссе"
        verbose_name_plural = "Ответы учеников: эссе"
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["question", "assignment"], name="unique_essay_answer")]

    def __str__(self):
        return f"{self.question.question[:20]} - {self.answer[:20]}"

    def clean(self):
        super().clean()
        if self.points is not None and self.question_id is not None:
            max_points = self.question.points
            if self.points > max_points:
                raise ValidationError(
                    {"points": f"Баллы не могут превышать максимальное количество баллов в вопросе ({max_points})."}
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
