import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from djoser.views import UserViewSet as DjoserUserViewSet
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import filters, permissions, serializers, status, throttling
from rest_framework.decorators import action
from rest_framework.response import Response

from api.mixins import RetrieveListViewSet, RetrieveUpdateViewSet
from users.models import Child, Class, School, Subject
from users.serializers import (
    ChildSerializer,
    ClassSerializer,
    ProfilePasswordChangeConfirmSerializer,
    ProfilePasswordChangeRequestSerializer,
    SchoolSerializer,
    SubjectSerializer,
)
from users.tokens import profile_password_change_token

logger = logging.getLogger("django.request")


class ProfilePasswordChangeThrottle(throttling.UserRateThrottle):
    scope = "profile_password_change"


class SubjectViewSet(RetrieveListViewSet):
    """
    Просмотр списка предметов.
    """

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = (permissions.AllowAny,)


class SchoolViewSet(RetrieveListViewSet):
    """
    Просмотр списка школ.

    Любой пользователь может получить список школ.
    """

    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = (permissions.AllowAny,)


class ClassViewSet(RetrieveListViewSet):
    """
    Просмотр списка классов.

    Любой пользователь может получить список классов.

    Доступен фильтр по id школы.
    Использование: ?school=id школы
    """

    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [filters.SearchFilter]
    search_fields = ("school__id",)


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

    @action(
        ["post"],
        detail=False,
        url_path="profile_password_change",
        permission_classes=[permissions.IsAuthenticated],
        serializer_class=ProfilePasswordChangeRequestSerializer,
        throttle_classes=[ProfilePasswordChangeThrottle],
    )
    def profile_password_change(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = profile_password_change_token.make_token(user)
        change_url = f"{settings.FRONTEND_SITE_URL}/profile/password-change/{uid}/{token}"
        send_mail(
            subject=f"Смена пароля на {settings.SITE_NAME}",
            message=(
                f"Здравствуйте, {user.first_name or user.email}!\n\n"
                "Для смены пароля перейдите по ссылке и введите текущий и новый пароли:\n"
                f"{change_url}\n\n"
                "Если вы не запрашивали смену пароля, проигнорируйте это письмо."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=render_to_string(
                "email/profile_password_change.html",
                {"user": user, "site_name": settings.SITE_NAME, "change_url": change_url},
            ),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        ["post"],
        detail=False,
        url_path="profile_password_change_confirm",
        permission_classes=[permissions.IsAuthenticated],
        serializer_class=ProfilePasswordChangeConfirmSerializer,
    )
    def profile_password_change_confirm(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    # @action(["post"], detail=False)
    # def reset_password(self, request, *args, **kwargs):
    #     try:
    #         return super().reset_password(request, *args, **kwargs)
    #     except Exception as e:
    #         logger.error("Password reset email send failed: %s", e)
    #         return Response(
    #             {"detail": "Не удалось отправить письмо. Попробуйте позже."},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         )

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
