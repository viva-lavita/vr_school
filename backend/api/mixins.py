from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet


class RetrieveUpdateViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, GenericViewSet):
    """Миксин только для чтения и обновления экземпляра."""

    pass


class RetrieveListViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, GenericViewSet):
    """Миксин только для чтения и получения списка экземпляров."""

    pass


class RetrieveViewSet(mixins.RetrieveModelMixin, GenericViewSet):
    """Миксин только для чтения экземпляра."""

    pass


class ListCreateRetrieveViewSet(
    mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, GenericViewSet
):
    """Миксин только для создания, чтения и получения списка экземпляров."""

    pass


class ListCreateRetrieveUpdateViewSet(ListCreateRetrieveViewSet, mixins.UpdateModelMixin):
    """Миксин только для создания, чтения, обновления и получения списка экземпляров."""

    pass


class CreateListViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, GenericViewSet):
    """Миксин только для создания и получения списка экземпляров."""

    pass


class CreateViewSet(mixins.CreateModelMixin, GenericViewSet):
    """Миксин только для создания экземпляра."""

    pass
