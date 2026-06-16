from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.mixins import CreateListViewSet, RetrieveListViewSet
from lessons.models import (
    Lesson,
    LessonChildAssignment,
    LessonClassAssignment,
    Test,
    TestQuestionAnswer,
    TestQuestionElement,
)
from lessons.serializers import LessonSerializer, TestDetailSerializer, TestQuestionAnswerSerializer, TestSerializer
from users.models import Child


class LessonViewSet(RetrieveListViewSet):
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)  # TODO: добавить верификацию ученика в юзера и пермишн сюда

    def get_queryset(self):
        # Ограничиваем выдачу только назначенными.
        child = Child.objects.get(parent=self.request.user)
        assignments = LessonClassAssignment.objects.filter(class_name=child.class_number).values_list(
            "lesson", flat=True
        )
        return Lesson.objects.filter(pk__in=assignments)


class TestViewSet(RetrieveListViewSet):
    """
    Просмотр тестов.

    Доступен фильтр по id урока.
    Использование: ?lesson=id урока
    """

    serializer_class = TestSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ("lesson",)

    def get_queryset(self):
        # Ограничиваем выдачу только назначенными классу ребенка.
        # TODO: добавить селект релейтед на модели элементов теста у test_detail
        child = Child.objects.get(parent=self.request.user)
        assignments = LessonClassAssignment.objects.filter(class_name=child.class_number).values_list(
            "lesson", flat=True
        )
        return Test.objects.filter(lesson__in=assignments)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["child"] = Child.objects.get(parent=self.request.user)
        return context

    @action(detail=True, methods=["get"], serializer_class=TestDetailSerializer)
    def test_detail(self, request, pk=None):
        """Для запроса при открытии тела теста (слайдов ответов)."""
        return self.retrieve(request, pk)


class TestQuestionAnswerViewSet(CreateListViewSet):
    """
    Получение и отправка ответов на вопросы теста.

    Доступ: только авторизированные пользователи, выдача ограничена ответами ученика.

    Механика: ответы по каждому вопросу запрашиваются индивидуально, при открытии слайда с этим вопросом.
    """

    serializer_class = TestQuestionAnswerSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        child = Child.objects.get(parent=self.request.user)
        # Ограничиваем выдачу только ответами ученика по назначенному тесту
        return TestQuestionAnswer.objects.filter(question=self.kwargs["question_id"], assignment__child=child)

    def create(self, request, *args, **kwargs):
        if self.get_queryset().exists():
            return Response({"error": "Вы уже ответили на этот вопрос"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            child = Child.objects.get(parent=self.request.user)
            question = TestQuestionElement.objects.get(pk=self.kwargs["question_id"])
            lesson_pk = question.test.lesson
            assignment = LessonChildAssignment.objects.get(child=child, class_assignment__lesson=lesson_pk)
            request.data["answer"] = request.data["answer"].strip().lower()
            is_correct = self.request.data["answer"] == question.answer
            new_answer = TestQuestionAnswer.objects.create(
                assignment=assignment, question_id=self.kwargs["question_id"], is_correct=is_correct, **request.data
            )
            return Response(TestQuestionAnswerSerializer(new_answer).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"], serializer_class=TestQuestionAnswerSerializer)
    def update_answer(self, request, *args, **kwargs):
        """Обновление ответа ученика."""
        try:
            # на модели unique constraint,  поэтому корректно использовать first
            updated = self.get_queryset().first()
            if updated:
                updated.answer = request.data["answer"]
                updated.save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return super().list(request, *args, **kwargs)
