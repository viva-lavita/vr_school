from django.db import transaction
from djoser.views import UserViewSet as DjoserUserViewSet
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.response import Response

from api.mixins import RetrieveUpdateViewSet
from users.models import Child
from users.serializers import ChildSerializer


@extend_schema_view(
    create=extend_schema(
        request=inline_serializer(
            name="InlineFormSerializer",
            fields={
                "email": serializers.EmailField(),
                "password": serializers.CharField(),
                "re_password": serializers.CharField(),
                "first_name": serializers.CharField(),
                "last_name": serializers.CharField(),
                "patronymic_name": serializers.CharField(),
                "date_of_birth": serializers.DateField(),
                "child": ChildSerializer(),
            },
        ),
    ),
)
class UserViewSet(DjoserUserViewSet):
    def get_permissions(self):
        if self.action == "me":
            self.permission_classes = (permissions.IsAuthenticated,)
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        """
        Доступ только для авторизованных пользователей.

        Пользователь может получить только свой профиль.
        Любой профиль может посмотреть только админ.
        """
        return super().retrieve(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        """
        Доступ только для авторизованных пользователей.

        Любой профиль может посмотреть только админ.
        Авторизованный пользователь может посмотреть свой профиль.
        """
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """Доступ только для неавторизованных пользователей."""
        child_data = request.data.pop("child", None)
        child_serializer = ChildSerializer(data=child_data)
        child_serializer.is_valid(raise_exception=True)
        child_instance = child_serializer.save()
        request.data["child"] = child_instance.id
        serializer = self.get_serializer(data=request.data)
        with transaction.atomic():
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                child_instance.parent = serializer.instance
                child_instance.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                child_instance.delete()
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Доступ только для авторизованных пользователей.

        Пользователь может обновить свой профиль.
        Любой профиль может обновить только админ.
        """
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Доступ только для авторизованных пользователей.

        Пользователь может обновить свой профиль.
        Любой профиль может обновить только админ.
        """
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Доступ только для авторизованных пользователей.

        Пользователь может удалить свой профиль.
        Любой профиль может удалить только админ.
        """
        # частично переопределено, т.к. требовался текущий пароль в теле запроса
        # тело при delete методе не одобряется OpenAPI
        if request.user.is_superuser or int(self.kwargs["id"]) == request.user.id:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class ChildViewSet(RetrieveUpdateViewSet):
    """
    Эндпоинты для работы с профилем ребенка.

    Доступ только для авторизованных пользователей.
    Пользователь может получить и изменить только профиль ребенка,
    родителем которого он является.
    """

    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return super().get_queryset().filter(parent=self.request.user)
