from django.db import models


class ContactMessage(models.Model):
    name = models.CharField("Имя и фамилия", max_length=150)
    email = models.EmailField("Электронная почта")
    phone = models.CharField("Телефон", max_length=20)
    comment = models.TextField("Комментарий", blank=True, null=True)
    accepted_policy = models.BooleanField("Согласие с политикой", default=False)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    class Meta:
        verbose_name = "Сообщение из формы обратной связи"
        verbose_name_plural = "Сообщения из формы обратной связи"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email})"
