from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import ContactMessageCreateViewSet, health_check

app_name = "api"


router = DefaultRouter()

router.register("contact-messages", ContactMessageCreateViewSet, basename="contact-messages")

urlpatterns = [
    path("", include(router.urls)),
    path("", include("users.urls")),
    path("", include("lessons.urls")),
    path("utils/health-check/", health_check, name="health-check"),
]
