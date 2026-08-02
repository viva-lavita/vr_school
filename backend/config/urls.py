from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

# from nested_admin import NestedAdminSite

# admin.site = NestedAdminSite()
# admin.autodiscover()


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")),
    path("schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
