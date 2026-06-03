from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User


ACCOUNT_EXISTS_MESSAGE = "An account with this email already exists"


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField()
    display_name = serializers.CharField(max_length=50)


class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    display_name = serializers.CharField(
        max_length=50,
        min_length=1,
        trim_whitespace=True,
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(ACCOUNT_EXISTS_MESSAGE)
        return email

    def validate_password(self, value):
        try:
            django_validate_password(value)
        except DjangoValidationError as err:
            raise serializers.ValidationError(err.messages) from err
        return value


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    def validate_email(self, value):
        return User.objects.normalize_email(value)


class AuthStateSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField()
    user = UserSerializer(allow_null=True)
