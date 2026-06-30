from django.urls import include, path
from rest_framework.routers import DefaultRouter

from lessons.views import LessonViewSet, TestCheckboxAnswerViewSet, TestQuestionAnswerViewSet, TestViewSet

app_name = "lessons"


router = DefaultRouter()

router.register("lessons", LessonViewSet, basename="lessons")
router.register("tests", TestViewSet, basename="tests")
router.register(r"test-answers/question/(?P<question_id>\d+)", TestQuestionAnswerViewSet, basename="test-answers")
router.register(
    r"test-answers/checkbox/(?P<question_id>\d+)", TestCheckboxAnswerViewSet, basename="test-checkbox-answers"
)

urlpatterns = [
    path("", include(router.urls)),
]
