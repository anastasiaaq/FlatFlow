from .models import User


class UserRepository:
    def get_user_by_email(self, email):
        return User.objects.filter(email__iexact=User.objects.normalize_email(email)).first()

    def create_user(self, *, email, password, display_name):
        return User.objects.create_user(
            email=email,
            password=password,
            display_name=display_name,
        )
