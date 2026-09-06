from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.mixins import CreateViewSet
from api.models import ContactMessage
from api.serializers import ContactMessageSerializer


@api_view(["GET"])
def health_check(request):
    return Response(status=status.HTTP_200_OK)


class ContactMessageCreateViewSet(CreateViewSet):
    """Форма обратной связи."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (AllowAny,)
    pagination_class = None
