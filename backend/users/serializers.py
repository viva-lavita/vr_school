from django.contrib.auth import get_user_model
from djoser.serializers import UserCreatePasswordRetypeSerializer as DjoserUserCreateSerializer
from djoser.serializers import UserSerializer as DjoserUserSerializer
from rest_framework import serializers

from api.utils import is_russian
from users.models import Child

User = get_user_model()


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ["pk", "first_name", "last_name", "patronymic_name", "date_of_birth", "school", "classroom"]

    def validate_first_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Имя должно состоять только из русских букв")
        return value

    def validate_last_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Фамилия должна состоять только из русских букв")
        return value

    def validate_patronymic_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Отчество должно состоять только из русских букв")
        return value

    def validate_date_of_birth(self, value):
        if not value:
            raise serializers.ValidationError("Дата рождения не может быть пустой")
        if self.instance and self.instance.date_of_birth and value > self.instance.date_of_birth:
            raise serializers.ValidationError("Дата рождения должна быть раньше даты регистрации")
        return value


class UserSerializer(DjoserUserSerializer):
    """
    Базовый сериализатор пользователя для всех action кроме 'create'.

    Выводится максимальная информация о пользователе.
    """

    child = ChildSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["pk", "email", "first_name", "last_name", "patronymic_name", "date_of_birth", "child"]

    def validate_first_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Имя должно состоять только из русских букв")
        return value

    def validate_last_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Фамилия должна состоять только из русских букв")
        return value

    def validate_patronymic_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Отчество должно состоять только из русских букв")
        return value

    def validate_date_of_birth(self, value):
        if not value:
            raise serializers.ValidationError("Дата рождения не может быть пустой")
        if self.instance.date_of_birth and value > self.instance.date_of_birth:
            raise serializers.ValidationError("Дата рождения должна быть раньше даты регистрации")
        return value


class UserCreateSerializer(DjoserUserCreateSerializer):
    """
    Сериализатор создания пользователя.
    """

    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)
    child = serializers.PrimaryKeyRelatedField(queryset=Child.objects.all())

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "re_password",
            "first_name",
            "last_name",
            "patronymic_name",
            "date_of_birth",
            "child",
        )
        extra_kwargs = {"patronymic_name": {"required": False}}

    def validate_first_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Имя должно состоять только из русских букв")
        return value

    def validate_last_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Фамилия должна состоять только из русских букв")
        return value

    def validate_patronymic_name(self, value):
        if not is_russian(value):
            raise serializers.ValidationError("Отчество должно состоять только из русских букв")
        return value

    def validate_date_of_birth(self, value):
        if not value:
            raise serializers.ValidationError("Дата рождения не может быть пустой")
        if self.instance and self.instance.date_of_birth and value > self.instance.date_of_birth:
            raise serializers.ValidationError("Дата рождения должна быть раньше даты регистрации")
        return value


class ShortReadUserSerializer(serializers.ModelSerializer):
    child = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "post", "email", "child")


class UserDeleteSerializer(serializers.Serializer):
    """
    Сериализатор удаления пользователя.

    Переопределено, т.к. Djoser по дефолту просит текущий пароль
    в теле запроса, что не поддерживается (и не одобряется) OpenAPI.
    """

    pass
