from django.urls import include, path
from rest_framework.routers import DefaultRouter

from users.views import ChildViewSet, ClassViewSet, SchoolViewSet, SubjectViewSet, UserViewSet

app_name = "users"


router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("child", ChildViewSet, basename="children")
router.register("school", SchoolViewSet, basename="schools")
router.register("subject", SubjectViewSet, basename="subjects")
router.register("class", ClassViewSet, basename="classes")


urlpatterns = [
    path("", include(router.urls)),
    path("", include("djoser.urls.jwt")),
]
