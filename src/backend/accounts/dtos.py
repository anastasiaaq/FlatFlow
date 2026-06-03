from dataclasses import dataclass


@dataclass
class UserCreateRequest:
    email: str
    display_name: str
    password: str


@dataclass
class UserLoginRequest:
    email: str
    password: str


@dataclass
class UserView:
    id: int
    email: str
    display_name: str

    @classmethod
    def from_user(cls, user):
        return cls(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
        )
