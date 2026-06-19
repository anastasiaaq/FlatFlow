from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .dtos import IssueCreateRequest, IssueUpdateRequest
from .serializers import (
    IssueCreateSerializer,
    IssueDetailSerializer,
    IssueUpdateSerializer,
)

from flatflow.common.container import container


ISSUE_ID_PARAMETER = OpenApiParameter(
    "id",
    int,
    OpenApiParameter.PATH,
    description="Issue ID.",
)


@extend_schema(tags=["issues"])
class IssueViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = IssueDetailSerializer
    lookup_value_regex = r"[0-9]+"

    @property
    def issue_service(self):
        return container.issue_service()

    def _detail_response(self, view, status_code):
        return Response(IssueDetailSerializer(view).data, status=status_code)

    @extend_schema(
        summary="List household issues",
        description="List all issues of the current household, newest first.",
        responses={status.HTTP_200_OK: IssueDetailSerializer(many=True)},
    )
    def list(self, request):
        views = self.issue_service.list_issues(request.user)
        return Response(
            IssueDetailSerializer(views, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Add household issue",
        description="Add a new issue to the current household.",
        request=IssueCreateSerializer,
        responses={status.HTTP_201_CREATED: IssueDetailSerializer},
    )
    def create(self, request):
        serializer = IssueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        view = self.issue_service.create_issue(
            request.user,
            IssueCreateRequest(**serializer.validated_data),
        )
        return self._detail_response(view, status.HTTP_201_CREATED)

    @extend_schema(
        summary="Edit household issue",
        parameters=[ISSUE_ID_PARAMETER],
        request=IssueUpdateSerializer,
        responses={status.HTTP_200_OK: IssueDetailSerializer},
    )
    def update(self, request, pk=None):
        serializer = IssueUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        view = self.issue_service.update_issue(
            request.user,
            int(pk),
            IssueUpdateRequest(**serializer.validated_data),
        )
        return self._detail_response(view, status.HTTP_200_OK)

    @extend_schema(
        summary="Delete household issue",
        parameters=[ISSUE_ID_PARAMETER],
        request=None,
        responses={status.HTTP_204_NO_CONTENT: None},
    )
    def destroy(self, request, pk=None):
        self.issue_service.delete_issue(request.user, int(pk))
        return Response(status=status.HTTP_204_NO_CONTENT)
