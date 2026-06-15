from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from flatflow.common.container import container

from .dtos import IssueCreateRequest, IssueListRequest, IssueUpdateRequest
from .models import Issue
from .serializers import (
    IssueCreateSerializer,
    IssueDetailSerializer,
    IssueFilterSerializer,
    IssueUpdateSerializer,
)


@extend_schema(tags=["issues"])
class IssueViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = IssueDetailSerializer
    queryset = Issue.objects.none()

    @property
    def issue_service(self):
        return container.issue_service()

    def _detail_response(self, view, status_code):
        return Response(IssueDetailSerializer(view).data, status=status_code)

    @extend_schema(
        summary="List issues",
        description=(
            "Return issues for the current household. Optionally filter by status. "
            "Open issues are listed first, then resolved; newest first within each "
            "group."
        ),
        parameters=[IssueFilterSerializer],
        responses={
            status.HTTP_200_OK: IssueDetailSerializer(many=True),
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def list(self, request):
        serializer = IssueFilterSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        issues = self.issue_service.list_issues(
            request.user,
            IssueListRequest(**serializer.validated_data),
        )
        return Response(
            IssueDetailSerializer(issues, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Create issue",
        description="Report a new issue in the current household.",
        request=IssueCreateSerializer,
        responses={
            status.HTTP_201_CREATED: IssueDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def create(self, request):
        serializer = IssueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        issue = self.issue_service.create_issue(
            request.user,
            IssueCreateRequest(**serializer.validated_data),
        )
        return self._detail_response(issue, status.HTTP_201_CREATED)

    @extend_schema(
        summary="Get issue",
        description="Return one issue from the current household.",
        responses={
            status.HTTP_200_OK: IssueDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def retrieve(self, request, pk=None):
        issue = self.issue_service.get_issue(request.user, pk)
        return self._detail_response(issue, status.HTTP_200_OK)

    @extend_schema(
        summary="Update issue",
        description="Edit an issue. Only the author may edit their own issue.",
        request=IssueUpdateSerializer,
        responses={
            status.HTTP_200_OK: IssueDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_403_FORBIDDEN: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def update(self, request, pk=None):
        return self._update(request, pk)

    @extend_schema(
        summary="Partially update issue",
        description="Edit one or more issue fields. Only the author may edit their own issue.",
        request=IssueUpdateSerializer,
        responses={
            status.HTTP_200_OK: IssueDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_403_FORBIDDEN: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def partial_update(self, request, pk=None):
        return self._update(request, pk)

    def _update(self, request, pk):
        serializer = IssueUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        issue = self.issue_service.update_issue(
            request.user,
            pk,
            IssueUpdateRequest(fields=dict(serializer.validated_data)),
        )
        return self._detail_response(issue, status.HTTP_200_OK)

    @extend_schema(
        summary="Delete issue",
        description="Delete an issue. Only the author may delete their own issue.",
        responses={
            status.HTTP_204_NO_CONTENT: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_403_FORBIDDEN: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def destroy(self, request, pk=None):
        self.issue_service.delete_issue(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Toggle issue status",
        description=(
            "Toggle an issue between open and resolved. Any household member may "
            "change the status (a resolved issue can be reopened)."
        ),
        request=None,
        responses={
            status.HTTP_200_OK: IssueDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    @action(detail=True, methods=["post"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        issue = self.issue_service.toggle_status(request.user, pk)
        return self._detail_response(issue, status.HTTP_200_OK)
