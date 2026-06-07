from django.db import IntegrityError

from .dtos import UserCreateRequest, UserProfileUpdateRequest
from .exceptions import UserAlreadyExistsError
from .models import User
from .repository import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def get_user_by_email(self, email):
        return self.user_repository.get_user_by_email(email)

    def get_user_profile(self, user: User) -> User:
        return self.user_repository.get_user_by_id(user.id)

    def create_user(self, user: UserCreateRequest) -> User:
        email = User.objects.normalize_email(user.email)
        display_name = user.display_name.strip()

        try:
            created_user = self.user_repository.create_user(
                email=email,
                password=user.password,
                display_name=display_name,
            )
        except IntegrityError as err:
            raise UserAlreadyExistsError() from err
        return created_user

    def update_user_profile(self, user: User, profile: UserProfileUpdateRequest) -> User:
        display_name = profile.display_name.strip()

        return self.user_repository.update_user_profile(
            user_id=user.id,
            display_name=display_name,
        )
