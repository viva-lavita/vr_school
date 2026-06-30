from rest_framework.serializers import ModelSerializer, SerializerMethodField

from lessons.models import (
    Lesson,
    LessonChildAssignment,
    Test,
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestCheckboxVariant,
    TestQuestionAnswer,
    TestQuestionElement,
)


class LessonSerializer(ModelSerializer):
    class Meta:
        model = Lesson
        fields = (
            "pk",
            "name",
            "description",
            "sub_description",
            "is_need_vpn",
            "video",
        )


class TestQuestionElementSerializer(ModelSerializer):
    class Meta:
        model = TestQuestionElement
        fields = (
            "pk",
            "question",
        )


class TestCheckboxVariantSerializer(ModelSerializer):
    class Meta:
        model = TestCheckboxVariant
        fields = (
            "pk",
            "answer",
        )


class TestCheckboxElementSerializer(ModelSerializer):
    """Сериализатор только для отображения вопроса."""

    is_many_answers = SerializerMethodField()
    variants = TestCheckboxVariantSerializer(many=True)

    class Meta:
        model = TestCheckboxElement
        fields = (
            "pk",
            "question",
            "variants",
            "is_many_answers",
        )

    def get_is_many_answers(self, obj):
        self.variants = TestCheckboxVariant.objects.filter(test_element=obj).all()
        self.is_many_answers = 0
        for variant in self.variants:
            if variant.is_correct:
                self.is_many_answers += 1
        return self.is_many_answers > 1


class TestSerializer(ModelSerializer):
    score = SerializerMethodField()

    class Meta:
        model = Test
        fields = (
            "pk",
            "name",
            "description",
            "score",
        )

    def get_score(self, obj):
        child = self.context["child"]
        lesson = obj.lesson
        # На модели ограничение unique_together(class_name, lesson) поэтому first() корректен
        return LessonChildAssignment.objects.filter(child=child, class_assignment__lesson=lesson).first().score


class TestDetailSerializer(ModelSerializer):
    q_tests = SerializerMethodField()
    checkbox_tests = SerializerMethodField()

    class Meta:
        model = Test
        fields = (
            "pk",
            "q_tests",
            "checkbox_tests",
        )

    def get_q_tests(self, obj: Test):
        return TestQuestionElementSerializer(TestQuestionElement.objects.filter(test=obj), many=True).data

    def get_checkbox_tests(self, obj: Test):
        return TestCheckboxElementSerializer(TestCheckboxElement.objects.filter(test=obj), many=True).data


class TestQuestionAnswerSerializer(ModelSerializer):
    class Meta:
        model = TestQuestionAnswer
        fields = (
            "pk",
            "answer",
        )


class TestCheckboxAnswerSerializer(ModelSerializer):
    class Meta:
        model = TestCheckboxAnswer
        fields = (
            "pk",
            "answers",
        )
