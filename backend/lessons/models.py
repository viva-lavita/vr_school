# from django.db import models
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class Subject(models.Model):
#     """Школьный предмет."""
#     name = models.CharField(max_length=100, verbose_name="Название предмета")
#     description = models.TextField(blank=True, verbose_name="Описание")

#     class Meta:
#         verbose_name = "Предмет"
#         verbose_name_plural = "Предметы"
#         ordering = ["name"]

#     def __str__(self):
#         return self.name


# class Teacher(models.Model):
#     """Преподаватель."""
#     user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
#     subject = models.ForeignKey(Subject, on_delete=models.PROTECT, verbose_name="Предмет")
#     created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

#     class Meta:
#         verbose_name = "Преподаватель"
#         verbose_name_plural = "Преподаватели"
#         ordering = ["-created_at"]
#         constraints = [
#             models.CheckConstraint(
#                 check=models.Q(user__is_teacher=True),
#                 name="user_is_teacher",
#             )
#         ]

#     def __str__(self):
#         return self.name


# class Lesson(models.Model):
#     """Урок."""
#     name = models.CharField(max_length=255, verbose_name="Название урока")
#     description = models.TextField(blank=True, verbose_name="Описание")
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name="Предмет")
#     teacher = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Преподаватель")
#     video = models.URLField(blank=True, verbose_name="Ссылка на видео")
#     sub_description = models.TextField(blank=True, verbose_name="Дополнительное описание")
#     created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
#     updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

#     class Meta:
#         verbose_name = "Урок"
#         verbose_name_plural = "Уроки"
#         ordering = ["name"]

#     def __str__(self):
#         return self.name


# # TODO: блок домашнее задание - Яндекс формы или AI генерация и т.д. отрисовка на фронте.
# # TODO: Комментарии к уроку - переписка между учителем и учеником (вывод комментариев только по этому ученику).
# # Вопрос: в формате чата или подойдет в формате комментарий от ученика - ответ от преподавателя.
# # Если простые комментарии, то будет обычная фильтрация по ученику (ответы учителя будут привязаны к комментарию от ученика). Две таблицы (комментарий и ответ на комментарий).
# # Если чат, то должна быть дополнительная таблица М2М (пользователь, урок) к которой будут привязываться комментарии преподавателя и юзера.
# # В админке тогда будет сложная схема назначения уроков, создание экземпляров прямо в коде админки?
