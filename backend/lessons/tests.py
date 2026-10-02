from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from lessons.models import Lesson, LessonClassAssignment
from users.models import Child, Class, School, Subject, Teacher


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
class LessonPaginationTests(TestCase):
    def test_catalog_returns_four_lessons_per_page_for_subject(self):
        user_model = get_user_model()
        parent = user_model.objects.create_user(email="parent@example.com", password="TestPass1!", is_active=True)
        school = School.objects.create(name="School")
        class_name = Class.objects.create(name="5A", school=school)
        Child.objects.create(
            parent=parent,
            first_name="Child",
            last_name="Student",
            patronymic_name="Test",
            date_of_birth=date(2014, 1, 1),
            school=school,
            class_number=class_name,
        )
        subject = Subject.objects.create(name="Math")
        other_subject = Subject.objects.create(name="History")
        teacher_user = user_model.objects.create_user(
            email="teacher@example.com", password="TestPass1!", is_teacher=True, is_active=True
        )
        other_teacher_user = user_model.objects.create_user(
            email="other@example.com", password="TestPass1!", is_teacher=True, is_active=True
        )
        teacher = Teacher.objects.create(user=teacher_user, subject=subject, school=school)
        other_teacher = Teacher.objects.create(user=other_teacher_user, subject=other_subject, school=school)

        lesson_ids = set()
        for index in range(5):
            lesson = Lesson.objects.create(name=f"Lesson {index}", teacher=teacher)
            lesson_ids.add(lesson.pk)
            LessonClassAssignment.objects.create(lesson=lesson, class_name=class_name)
        other_lesson = Lesson.objects.create(name="Other subject", teacher=other_teacher)
        LessonClassAssignment.objects.create(lesson=other_lesson, class_name=class_name)

        client = APIClient()
        client.force_authenticate(user=parent)
        first = client.get(f"/api/v1/lessons/?search={subject.pk}&page=1")
        second = client.get(f"/api/v1/lessons/?search={subject.pk}&page=2")

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data["count"], 5)
        self.assertEqual(second.data["count"], 5)
        self.assertEqual(len(first.data["results"]), 4)
        self.assertEqual(len(second.data["results"]), 1)
        self.assertIsNotNone(first.data["next"])
        self.assertIsNone(second.data["next"])
        self.assertEqual({lesson["pk"] for lesson in first.data["results"] + second.data["results"]}, lesson_ids)
