from django.urls import include, path
from rest_framework.routers import DefaultRouter

from lessons.views import (
    LessonViewSet,
    TestCheckboxAnswerViewSet,
    TestEssayAnswerViewSet,
    TestKeyValueAnswerViewSet,
    TestQuestionAnswerViewSet,
    TestViewSet,
)

app_name = "lessons"


router = DefaultRouter()

router.register("lessons", LessonViewSet, basename="lessons")
router.register("tests", TestViewSet, basename="tests")
router.register(r"test-answers/question/(?P<question_id>\d+)", TestQuestionAnswerViewSet, basename="test-answers")
router.register(r"test-answers/essay/(?P<question_id>\d+)", TestEssayAnswerViewSet, basename="test-essay-answers")
router.register(
    r"test-answers/checkbox/(?P<question_id>\d+)", TestCheckboxAnswerViewSet, basename="test-checkbox-answers"
)
router.register(
    r"test-answers/key-value/(?P<question_id>\d+)", TestKeyValueAnswerViewSet, basename="test-key-value-answers"
)

urlpatterns = [
    path("", include(router.urls)),
]
