from django.db import transaction
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
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestCheckboxVariant,
    TestKeyValueAnswer,
    TestKeyValueElement,
    TestQuestionAnswer,
    TestQuestionElement,
)
from lessons.serializers import (
    AnswersPayloadSerializer,
    LessonSerializer,
    TestCheckboxAnswerSerializer,
    TestDetailSerializer,
    TestKeyValueAnswerSerializer,
    TestQuestionAnswerSerializer,
    TestSerializer,
)
from users.models import Child


class LessonViewSet(RetrieveListViewSet):
    """
    Просмотр уроков.

    Доступен фильтр по id предмета.
    Использование: ?search=id предмета.
    """

    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)  # TODO: добавить верификацию ученика в модель юзера и пермишн сюда
    filter_backends = [filters.SearchFilter]
    search_fields = ("teacher__subject__id",)

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
        """
        Для запроса при открытии тела теста (слайдов ответов).

        Здесь отображаются все вопросы теста.
        Перед отображением юзеру, запросите ответы ученика, по каждому открытому слайду отдельно, чтобы юзер смог изменить свой вариант ответа, если тест еще не проверен.
        Т.е. когда юзер открывает тест - запрашиваете наличие ответа только на первый вопрос, по мере листания слайдов - запрашиваете ответы на следующие, каждый отдельно.
        Так сделано из-за сложности получения всех ответов ученика в одном запросе, и того, что каждый слайд снабжен кнопкой сабмита.
        """
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
            question = TestQuestionElement.objects.select_related("test").get(pk=self.kwargs["question_id"])
            lesson_pk = question.test.lesson
            assignment = LessonChildAssignment.objects.get(child=child, class_assignment__lesson=lesson_pk)
            # установка флага в процессе прохождения теста
            if not assignment.in_progress:
                assignment.in_progress = True
                assignment.save()
            request.data["answer"] = request.data["answer"].strip().lower()
            points = question.points if request.data["answer"] == question.answer else 0
            new_answer = TestQuestionAnswer.objects.create(
                assignment=assignment, question_id=self.kwargs["question_id"], points=points, **request.data
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
                question = TestQuestionElement.objects.get(pk=self.kwargs["question_id"])
                request.data["answer"] = request.data["answer"].strip().lower()
                points = question.points if request.data["answer"] == question.answer else 0
                updated.answer = request.data["answer"]
                updated.points = points
                updated.save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return super().list(request, *args, **kwargs)


class TestCheckboxAnswerViewSet(CreateListViewSet):
    """
    Получение и отправка ответов на вопросы теста.

    Доступ: только авторизированные пользователи, выдача ограничена ответами ученика.

    Механика: ответы по каждому вопросу запрашиваются индивидуально, при открытии слайда с этим вопросом.
    """

    serializer_class = TestCheckboxAnswerSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        child = Child.objects.get(parent=self.request.user)
        # Ограничиваем выдачу только ответами ученика по назначенному тесту
        return TestCheckboxAnswer.objects.filter(question=self.kwargs["question_id"], assignment__child=child)

    def create(self, request, *args, **kwargs):
        """
        Создание ответа ученика.

        В тесте может быть несколько вариантов ответа.
        В answer передается список id выбранных пользователем вариантов ответа.
        """
        if self.get_queryset().exists():
            return Response({"error": "Вы уже ответили на этот вопрос"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                child = Child.objects.get(parent=self.request.user)
                question = TestCheckboxElement.objects.select_related("test").get(pk=self.kwargs["question_id"])

                lesson_pk = question.test.lesson
                assignment = LessonChildAssignment.objects.get(child=child, class_assignment__lesson=lesson_pk)
                # установка флага в процессе прохождения теста
                if not assignment.in_progress:
                    assignment.in_progress = True
                    assignment.save()
                variants = TestCheckboxVariant.objects.filter(test_element__id=self.kwargs["question_id"]).all()
                points = 0
                for answer in request.data["answers"]:
                    points += variants.get(id=answer).points
                new_answer = TestCheckboxAnswer.objects.create(
                    assignment=assignment, question_id=self.kwargs["question_id"], points=points
                )
                for answer in request.data["answers"]:
                    new_answer.answers.add(answer)
                return Response(TestCheckboxAnswerSerializer(new_answer).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"], serializer_class=TestCheckboxAnswerSerializer)
    def update_answer(self, request, *args, **kwargs):
        try:
            # на модели unique constraint,  поэтому корректно использовать first
            updated = self.get_queryset().first()
            if updated:
                variants = TestCheckboxVariant.objects.filter(test_element__id=self.kwargs["question_id"]).all()
                points = 0
                for answer in request.data["answers"]:
                    points += variants.get(id=answer).points
                updated.points = points
                updated.save()
                updated.answers.clear()
                for answer in request.data["answers"]:
                    updated.answers.add(answer)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return super().list(request, *args, **kwargs)


class TestKeyValueAnswerViewSet(CreateListViewSet):
    """
    Получение и отправка ответов на вопросы теста.

    Доступ: только авторизированные пользователи, выдача ограничена ответами ученика.

    Механика: ответы по каждому вопросу запрашиваются индивидуально, при открытии слайда с этим вопросом.
    """

    serializer_class = AnswersPayloadSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        child = Child.objects.get(parent=self.request.user)
        # Ограничиваем выдачу только ответами ученика по назначенному тесту
        return TestKeyValueAnswer.objects.filter(question=self.kwargs["question_id"], assignment__child=child)

    def create(self, request, *args, **kwargs):
        """
        Создание ответа на тип вопроса 'Ключ-значение'.

        В тело запроса нужно передавать подобный json:
        ```json
        {
            "answers": [
                {
                "key": 1,
                "values": [1, 2, 3]
                },
                {
                "key": 2,
                "values": [4, 5, 6]
                }
            ]
        }
        где key - id ключа, values - id значений выбранных пользователем к этому ключу.
        ```
        """
        if self.get_queryset().exists():
            return Response({"error": "Вы уже ответили на этот вопрос"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                child = Child.objects.get(parent=self.request.user)
                question = TestKeyValueElement.objects.select_related("test").get(pk=self.kwargs["question_id"])

                lesson_pk = question.test.lesson
                assignment = LessonChildAssignment.objects.get(child=child, class_assignment__lesson=lesson_pk)
                # установка флага в процессе прохождения теста
                if not assignment.in_progress:
                    assignment.in_progress = True
                    assignment.save()
                new_answer = TestKeyValueAnswer.objects.create(
                    assignment=assignment, question_id=self.kwargs["question_id"], answers=request.data["answers"]
                )
                return Response(TestKeyValueAnswerSerializer(new_answer).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"], serializer_class=TestKeyValueAnswerSerializer)
    def update_answer(self, request, *args, **kwargs):
        """
        Обновление ответа ученика.

        В тело запроса нужно передавать подобный json:
        ```json
        {
            "answers": [
                {
                "key": 1,
                "values": [1, 2, 3]
                },
                {
                "key": 2,
                "values": [4, 5, 6]
                }
            ]
        }
        где key - id ключа, values - id значений выбранных пользователем к этому ключу.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            # на модели unique constraint,  поэтому корректно использовать first
            updated = self.get_queryset().first()
            if updated:
                updated.answers = request.data["answers"]
                updated.save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return super().list(request, *args, **kwargs)
