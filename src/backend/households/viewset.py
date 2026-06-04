from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .dtos import HouseholdCreateRequest, HouseholdJoinRequest
from .serializers import (
    HouseholdCreateSerializer,
    HouseholdDetailSerializer,
    HouseholdJoinSerializer,
    LeaveResultSerializer,
)

from flatflow.common.container import container


@extend_schema(tags=["households"])
class HouseholdViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = HouseholdDetailSerializer

    @property
    def household_service(self):
        return container.household_service()

    def _household_payload(self, household):
        return {
            "id": household.id,
            "name": household.name,
            "invite_code": household.invite_code,
            "created_at": household.created_at,
            "created_by": household.created_by,
            "members": self.household_service.list_members(household),
        }

    def _detail_response(self, household, status_code):
        serializer = HouseholdDetailSerializer(self._household_payload(household))
        return Response(serializer.data, status=status_code)

    @extend_schema(
        summary="Create household",
        description="Create a new household and join it as the first member.",
        request=HouseholdCreateSerializer,
        responses={
            status.HTTP_201_CREATED: HouseholdDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_409_CONFLICT: None,
        },
    )
    def create(self, request):
        serializer = HouseholdCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        household = self.household_service.create_household(
            request.user,
            HouseholdCreateRequest(**serializer.validated_data),
        )
        return self._detail_response(household, status.HTTP_201_CREATED)

    @extend_schema(
        summary="Current household",
        description="Return the household the current user belongs to, with its members.",
        responses={
            status.HTTP_200_OK: HouseholdDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    @action(detail=False, methods=["get"])
    def current(self, request):
        household = self.household_service.get_current_household(request.user)
        return self._detail_response(household, status.HTTP_200_OK)

    @extend_schema(
        summary="Join household",
        description="Join an existing household using its invite code.",
        request=HouseholdJoinSerializer,
        responses={
            status.HTTP_200_OK: HouseholdDetailSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
            status.HTTP_409_CONFLICT: None,
        },
    )
    @action(detail=False, methods=["post"])
    def join(self, request):
        serializer = HouseholdJoinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        household = self.household_service.join_household(
            request.user,
            HouseholdJoinRequest(**serializer.validated_data),
        )
        return self._detail_response(household, status.HTTP_200_OK)

    @extend_schema(
        summary="Leave household",
        description=(
            "Leave the current household. If the user is the last member, the "
            "household and all its data are deleted."
        ),
        request=None,
        responses={
            status.HTTP_200_OK: LeaveResultSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    @action(detail=False, methods=["post"])
    def leave(self, request):
        result = self.household_service.leave_household(request.user)
        serializer = LeaveResultSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)
