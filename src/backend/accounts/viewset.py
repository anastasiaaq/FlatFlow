from django.conf import settings
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .dtos import UserCreateRequest, UserProfileUpdateRequest
from .exceptions import UserAlreadyExistsError
from .serializers import (
    ACCOUNT_EXISTS_MESSAGE,
    AuthStateSerializer,
    UserCreateSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)

from flatflow.common.container import container

INVALID_LOGIN_MESSAGE = "Invalid email or password"


@extend_schema(tags=["users"])
class UserViewSet(viewsets.GenericViewSet):
    serializer_class = UserSerializer

    @property
    def user_service(self):
        return container.user_service()

    def _persist_session(self, request):
        request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    @extend_schema(
        summary="Register user",
        description=(
            "Create a new user account and start an authenticated session."
        ),
        request=UserCreateSerializer,
        responses={status.HTTP_201_CREATED: AuthStateSerializer},
    )
    def create(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserCreateRequest(**serializer.validated_data)
        try:
            created_user = self.user_service.create_user(user)
        except UserAlreadyExistsError:
            return Response(
                {"email": [ACCOUNT_EXISTS_MESSAGE]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        auth_login(request, created_user)
        self._persist_session(request)
        return Response(
            self._auth_state(created_user),
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Login user",
        description=(
            "Authenticate a user and start a persisted session."
        ),
        request=UserLoginSerializer,
        responses={
            status.HTTP_200_OK: AuthStateSerializer,
            status.HTTP_401_UNAUTHORIZED: None,
        },
    )
    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        authenticated_user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if authenticated_user is None:
            return Response(
                {"detail": INVALID_LOGIN_MESSAGE},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        auth_login(request, authenticated_user)
        self._persist_session(request)
        return Response(
            self._auth_state(authenticated_user),
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Logout user",
        description=(
            "End the current session. This is idempotent for anonymous or expired sessions."
        ),
        request=None,
        responses={status.HTTP_200_OK: AuthStateSerializer},
    )
    @action(detail=False, methods=["post"])
    def logout(self, request):
        auth_logout(request)
        return Response(
            self._auth_state(request.user),
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Set CSRF cookie",
        description="Issue a csrftoken cookie for browser clients before unsafe requests.",
        request=None,
        responses={status.HTTP_204_NO_CONTENT: None},
    )
    @action(detail=False, methods=["get"])
    def csrf(self, request):
        get_token(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Current auth state",
        description="Return the current user's authentication state.",
        responses={status.HTTP_200_OK: AuthStateSerializer},
    )
    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(
            self._auth_state(request.user),
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Current user profile",
        description="Return the authenticated user's profile.",
        responses={status.HTTP_200_OK: UserProfileSerializer},
    )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="profile",
    )
    def profile(self, request):
        user = self.user_service.get_user_profile(request.user)
        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Update user profile",
        description="Update the authenticated user's profile.",
        request=UserProfileUpdateSerializer,
        responses={
            status.HTTP_200_OK: UserProfileSerializer,
            status.HTTP_400_BAD_REQUEST: UserProfileUpdateSerializer,
        },
    )
    @profile.mapping.patch
    def update_profile(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = UserProfileUpdateRequest(**serializer.validated_data)
        user = self.user_service.update_user_profile(request.user, profile)

        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_200_OK,
        )

    def _has_household(self, user):
        return hasattr(user, "membership")

    def _auth_state(self, user):
        if not user.is_authenticated:
            return {
                "authenticated": False,
                "user": None,
                "has_household": False,
            }

        return {
            "authenticated": True,
            "user": UserSerializer(user).data,
            "has_household": self._has_household(user),
        }
