from .models import User


class UserRepository:
    def get_user_by_id(self, user_id):
        return User.objects.get(id=user_id)

    def get_user_by_email(self, email):
        return User.objects.filter(email__iexact=User.objects.normalize_email(email)).first()

    def create_user(self, *, email, password, display_name):
        return User.objects.create_user(
            email=email,
            password=password,
            display_name=display_name,
        )

    def update_user_profile(self, *, user_id, display_name):
        user = self.get_user_by_id(user_id)
        user.display_name = display_name
        user.save(update_fields=["display_name"])
        return user
