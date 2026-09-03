from rest_framework import serializers

from lessons.models import (
    Lesson,
    LessonChildAssignment,
    Test,
    TestCheckboxAnswer,
    TestCheckboxElement,
    TestCheckboxVariant,
    TestEssayAiAnswer,
    TestEssayAnswer,
    TestEssayElement,
    TestKeyValueAnswer,
    TestKeyValueElement,
    TestKeyVariant,
    TestQuestionAnswer,
    TestQuestionElement,
    TestValueVariant,
)
from users.models import Child


class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    in_progress = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            "pk",
            "name",
            "description",
            "sub_description",
            "image",
            "is_need_vpn",
            "video",
            "in_progress",
            "is_completed",
        )

    def get_is_completed(self, obj):
        completed_at = (
            LessonChildAssignment.objects.filter(
                child=Child.objects.get(parent=self.context["request"].user), class_assignment__lesson=obj
            )
            .get()
            .completed_at
        )
        return True if completed_at else False

    def get_in_progress(self, obj):
        return (
            LessonChildAssignment.objects.filter(
                child=Child.objects.get(parent=self.context["request"].user), class_assignment__lesson=obj
            )
            .get()
            .in_progress
        )


class TestSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()

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


class TestDetailSerializer(serializers.ModelSerializer):
    q_tests = serializers.SerializerMethodField()
    checkbox_tests = serializers.SerializerMethodField()
    key_value_tests = serializers.SerializerMethodField()
    essay_test = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = (
            "pk",
            "q_tests",
            "checkbox_tests",
            "key_value_tests",
            "essay_test",
        )

    def get_q_tests(self, obj: Test):
        return TestQuestionElementSerializer(TestQuestionElement.objects.filter(test=obj), many=True).data

    def get_checkbox_tests(self, obj: Test):
        return TestCheckboxElementSerializer(TestCheckboxElement.objects.filter(test=obj), many=True).data

    def get_key_value_tests(self, obj: Test):
        elements = TestKeyValueElement.objects.filter(test=obj).prefetch_related("keys", "keys__values")
        return TestKeyValueElementSerializer(elements, many=True).data

    def get_essay_test(self, obj: Test):
        return TestEssayElementSerializer(TestEssayElement.objects.filter(test=obj), many=True).data


class TestQuestionElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestQuestionElement
        fields = (
            "pk",
            "question",
        )


class TestQuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestQuestionAnswer
        fields = (
            "pk",
            "answer",
        )


class TestCheckboxVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCheckboxVariant
        fields = (
            "pk",
            "answer",
        )


class TestCheckboxElementSerializer(serializers.ModelSerializer):
    """Сериализатор только для отображения вопроса."""

    is_many_answers = serializers.SerializerMethodField()
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


class TestCheckboxAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCheckboxAnswer
        fields = (
            "pk",
            "answers",
        )


class TestValueVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestValueVariant
        fields = (
            "pk",
            "value",
        )


class TestKeyVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestKeyVariant
        fields = (
            "pk",
            "key",
        )


class TestKeyValueElementSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    description = serializers.CharField(read_only=True)
    keys = TestKeyVariantSerializer(many=True, read_only=True)
    values = serializers.SerializerMethodField()

    def get_values(self, obj):
        qs = TestValueVariant.objects.filter(key__test_element=obj)
        return TestValueVariantSerializer(qs, many=True).data


class AnswerMappingSerializer(serializers.Serializer):
    """
    Валидирует один элемент структуры:
    {
      "key": 1,
      "values": [1, 2, 3]
    }
    """

    key = serializers.IntegerField()
    values = serializers.ListField(child=serializers.IntegerField(), min_length=1)

    def validate_key(self, value):
        # ключ существует и принадлежит какому-то элементу теста
        if not TestKeyVariant.objects.filter(pk=value).exists():
            raise serializers.ValidationError(f"Ключ с ID {value} не найден.")
        return value

    def validate_values(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("В списке values не должно быть дубликатов.")

        existing_pks = set(TestValueVariant.objects.filter(pk__in=value).values_list("pk", flat=True))
        missing = [v for v in value if v not in existing_pks]
        if missing:
            raise serializers.ValidationError(f"Значения с ID {missing} не найдены.")
        return value


class AnswersPayloadSerializer(serializers.Serializer):
    """
    Валидирует всю полезную нагрузку:
    {
      "answers": [
        {"key": 1, "values": [1, 2, 3]},
        {"key": 2, "values": [4, 5, 6]}
      ]
    }
    """

    answers = serializers.ListField(child=AnswerMappingSerializer(), min_length=1)

    def validate(self, data):
        """
        Дополнительная валидация на уровне всей структуры.
        Например: не должно быть дублей ключей в списке answers.
        """
        keys = [item["key"] for item in data["answers"]]
        if len(set(keys)) != len(keys):
            raise serializers.ValidationError("Ключи в списке answers должны быть уникальными.")
        return data


class TestKeyValueAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestKeyValueAnswer
        fields = (
            "pk",
            "answers",
        )


class TestEssayElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestEssayElement
        fields = (
            "pk",
            "question",
        )


class TestEssayAnswerSerializer(serializers.ModelSerializer):
    is_verified = serializers.ReadOnlyField()

    class Meta:
        model = TestEssayAnswer
        fields = (
            "pk",
            "answer",
            "is_verified",
        )


class TestEssayAnswerAISerializer(serializers.ModelSerializer):
    class Meta:
        model = TestEssayAiAnswer
        fields = (
            "pk",
            "answer",
        )
