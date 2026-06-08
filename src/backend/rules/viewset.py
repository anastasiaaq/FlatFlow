from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .dtos import RuleCreateRequest, RuleUpdateRequest
from .serializers import RuleDetailSerializer, RuleWriteSerializer

from flatflow.common.container import container


RULE_ID_PARAMETER = OpenApiParameter(
    "id",
    int,
    OpenApiParameter.PATH,
    description="Rule ID.",
)


@extend_schema(tags=["rules"])
class RuleViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RuleDetailSerializer
    # Numeric ids only, so a non-numeric path 404s at routing instead of failing int(pk).
    lookup_value_regex = r"[0-9]+"

    @property
    def rule_service(self):
        return container.rule_service()

    def _detail_response(self, view, status_code):
        return Response(RuleDetailSerializer(view).data, status=status_code)

    @extend_schema(
        summary="List house rules",
        description="List all house rules of the current household in chronological order.",
        responses={
            status.HTTP_200_OK: RuleDetailSerializer(many=True),
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def list(self, request):
        views = self.rule_service.list_rules(request.user)
        return Response(
            RuleDetailSerializer(views, many=True).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Add house rule",
        description="Add a new house rule to the current household.",
        request=RuleWriteSerializer,
        responses={
            status.HTTP_201_CREATED: RuleDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def create(self, request):
        serializer = RuleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        view = self.rule_service.create_rule(
            request.user,
            RuleCreateRequest(**serializer.validated_data),
        )
        return self._detail_response(view, status.HTTP_201_CREATED)

    @extend_schema(
        summary="Edit house rule",
        description=(
            "Edit any house rule of the current household. Records the editor as "
            "the last-modified-by member."
        ),
        parameters=[RULE_ID_PARAMETER],
        request=RuleWriteSerializer,
        responses={
            status.HTTP_200_OK: RuleDetailSerializer,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def update(self, request, pk=None):
        serializer = RuleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        view = self.rule_service.update_rule(
            request.user,
            int(pk),
            RuleUpdateRequest(**serializer.validated_data),
        )
        return self._detail_response(view, status.HTTP_200_OK)

    @extend_schema(
        summary="Delete house rule",
        description="Delete any house rule of the current household.",
        parameters=[RULE_ID_PARAMETER],
        request=None,
        responses={
            status.HTTP_204_NO_CONTENT: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def destroy(self, request, pk=None):
        self.rule_service.delete_rule(request.user, int(pk))
        return Response(status=status.HTTP_204_NO_CONTENT)
