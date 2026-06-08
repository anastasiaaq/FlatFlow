from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from flatflow.common.container import container

from .dtos import ChoreCreateRequest, ChoreListRequest, ChoreUpdateRequest
from .models import Chore
from .serializers import (
    ChoreCreateSerializer,
    ChoreDetailSerializer,
    ChoreFilterSerializer,
    ChoreUpdateSerializer,
)


@extend_schema(tags=["chores"])
class ChoreViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChoreDetailSerializer
    queryset = Chore.objects.none()

    @property
    def chore_service(self):
        return container.chore_service()

    def _detail_response(self, view, status_code):
        return Response(ChoreDetailSerializer(view).data, status=status_code)

    @extend_schema(
        summary="List chores",
        description=(
            "Return chores for the current household, with optional assignee and "
            "status filters. The default sort follows the chore-list priority order."
        ),
        parameters=[ChoreFilterSerializer],
        responses={
            status.HTTP_200_OK: ChoreDetailSerializer(many=True),
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def list(self, request):
        serializer = ChoreFilterSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        chores = self.chore_service.list_chores(
            request.user,
            ChoreListRequest(**serializer.validated_data),
        )
        return Response(
            ChoreDetailSerializer(chores, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Create chore",
        description="Create a Task or Duty in the current household.",
        request=ChoreCreateSerializer,
        responses={
            status.HTTP_201_CREATED: ChoreDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def create(self, request):
        serializer = ChoreCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chore = self.chore_service.create_chore(
            request.user,
            ChoreCreateRequest(**serializer.validated_data),
        )
        return self._detail_response(chore, status.HTTP_201_CREATED)

    @extend_schema(
        summary="Get chore",
        description="Return one chore from the current household.",
        responses={
            status.HTTP_200_OK: ChoreDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def retrieve(self, request, pk=None):
        chore = self.chore_service.get_chore(request.user, pk)
        return self._detail_response(chore, status.HTTP_200_OK)

    @extend_schema(
        summary="Update chore",
        description=(
            "Edit a chore. Chore type is immutable; status may be changed to "
            "reopen or complete a chore."
        ),
        request=ChoreUpdateSerializer,
        responses={
            status.HTTP_200_OK: ChoreDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def update(self, request, pk=None):
        return self._update(request, pk)

    @extend_schema(
        summary="Partially update chore",
        description=(
            "Edit one or more chore fields. Chore type is immutable; status may "
            "be changed to reopen or complete a chore."
        ),
        request=ChoreUpdateSerializer,
        responses={
            status.HTTP_200_OK: ChoreDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def partial_update(self, request, pk=None):
        return self._update(request, pk)

    def _update(self, request, pk):
        serializer = ChoreUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chore = self.chore_service.update_chore(
            request.user,
            pk,
            ChoreUpdateRequest(fields=dict(serializer.validated_data)),
        )
        return self._detail_response(chore, status.HTTP_200_OK)

    @extend_schema(
        summary="Delete chore",
        description="Delete a chore from the current household.",
        responses={
            status.HTTP_204_NO_CONTENT: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def destroy(self, request, pk=None):
        self.chore_service.delete_chore(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Mark chore completed",
        description=(
            "Mark a chore completed as the current user. Tasks can be completed "
            "at any time; Duties can be completed from their start date onward."
        ),
        request=None,
        responses={
            status.HTTP_200_OK: ChoreDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        chore = self.chore_service.complete_chore(request.user, pk)
        return self._detail_response(chore, status.HTTP_200_OK)
