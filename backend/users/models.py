from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.db import models


def validate_user_is_teacher(user):
    if not user.is_teacher:
        raise ValidationError("Пользователь должен иметь флаг is_teacher=True")


class School(models.Model):
    """Школа."""

    name = models.CharField(
        verbose_name="Название",
        max_length=100,
        unique=True,
        help_text="Не более 100 символов.",
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Школа"
        verbose_name_plural = "Школы"
        ordering = ["name"]


class Class(models.Model):
    """Класс."""

    name = models.CharField(
        verbose_name="Название",
        max_length=100,
        help_text="Не более 100 символов.",
    )
    school = models.ForeignKey(
        School,
        verbose_name="Школа",
        on_delete=models.CASCADE,
        related_name="classes",
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Класс"
        verbose_name_plural = "Классы"
        ordering = ["name"]
        unique_together = ("name", "school")


class Subject(models.Model):
    """Школьный предмет."""

    name = models.CharField(max_length=100, verbose_name="Название предмета")
    description = models.TextField(blank=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"
        ordering = ["name"]

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Пользователь-родитель."""

    first_name = models.CharField(
        verbose_name="Имя",
        max_length=50,
        blank=True,
        null=True,
        help_text="Не более 50 символов.",
    )
    last_name = models.CharField(
        verbose_name="Фамилия",
        max_length=50,
        blank=True,
        null=True,
        help_text="Не более 50 символов.",
    )
    patronymic_name = models.CharField(
        verbose_name="Отчество",
        max_length=50,
        blank=True,
        null=True,
        help_text=" более 50 символов.",
    )
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        verbose_name="Дата рождения",
    )
    email = models.EmailField(
        verbose_name="Email",
        max_length=254,
        unique=True,
        db_index=True,
        help_text="Не более 254 символов. Только буквы, цифры и @/./+/-/_.",
        error_messages={
            "unique": "Пользователь с таким email уже существует.",
            "invalid": "Некорректный email.",
            "max_length": "Email слишком длинный.",
        },
    )
    is_teacher = models.BooleanField(
        verbose_name="Преподаватель",
        default=False,
    )
    created_at = models.DateTimeField(
        verbose_name="Дата создания",
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        verbose_name="Дата обновления",
        auto_now=True,
    )

    USERNAME_FIELD = "email"  # переопределение поля для логина
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    @property
    def username(self):
        """Поле username упразднено из модели, но необходимо для работы."""
        return self.get_username()

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Child(models.Model):
    """Данные ребенка."""

    parent = models.OneToOneField(
        User,
        related_name="child",
        verbose_name="Родитель",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    first_name = models.CharField(
        verbose_name="Имя",
        max_length=50,
        help_text="Обязательное поле. Не более 50 символов.",
    )
    last_name = models.CharField(
        verbose_name="Фамилия",
        max_length=50,
        help_text="Обязательное поле. Не более 50 символов.",
    )
    patronymic_name = models.CharField(
        verbose_name="Отчество",
        max_length=50,
        help_text="Обязательное поле. Не более 50 символов.",
    )
    date_of_birth = models.DateField(
        verbose_name="Дата рождения",
        help_text="Обязательное поле.",
    )
    school = models.ForeignKey(
        School,
        verbose_name="Школа",
        on_delete=models.SET_NULL,
        related_name="children",
        blank=True,
        null=True,
    )
    class_number = models.ForeignKey(
        Class,
        verbose_name="Класс",
        on_delete=models.SET_NULL,
        related_name="children",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(
        verbose_name="Дата создания",
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        verbose_name="Дата обновления",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Ребенок"
        verbose_name_plural = "Дети"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Teacher(models.Model):
    """Преподаватель."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher", verbose_name="Пользователь")
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name="teachers", verbose_name="Предмет")
    school = models.ForeignKey(School, on_delete=models.PROTECT, related_name="teachers", verbose_name="Школа")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Преподаватель"
        verbose_name_plural = "Преподаватели"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}" or "Преподаватель"

    def clean(self):
        super().clean()
        if not self.user.is_teacher:
            raise ValidationError("Пользователь должен иметь флаг is_teacher=True")
