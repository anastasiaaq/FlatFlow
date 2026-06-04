from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError

from .dtos import UserCreateRequest
from .exceptions import UserAlreadyExistsError
from .models import User
from .repository import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def get_user_by_email(self, email):
        return self.user_repository.get_user_by_email(email)

    def create_user(self, user: UserCreateRequest) -> User:
        email = User.objects.normalize_email(user.email)
        display_name = user.display_name.strip()

        if not display_name:
            raise ValidationError("Display name is required.")

        validate_email(email)
        password_validation_user = User(email=email, display_name=display_name)
        validate_password(user.password, user=password_validation_user)

        try:
            created_user = self.user_repository.create_user(
                email=email,
                password=user.password,
                display_name=display_name,
            )
        except IntegrityError as err:
            raise UserAlreadyExistsError() from err
        return created_user
