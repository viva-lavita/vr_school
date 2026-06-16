from rest_framework.serializers import ModelSerializer, SerializerMethodField

from lessons.models import (
    Lesson,
    LessonChildAssignment,
    Test,
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
    variants = TestCheckboxVariantSerializer(many=True)

    class Meta:
        model = TestCheckboxElement
        fields = (
            "pk",
            "question",
            "variants",
        )


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
