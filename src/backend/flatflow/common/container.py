from dependency_injector import containers, providers

from accounts.repository import UserRepository
from accounts.service import UserService


class Container(containers.DeclarativeContainer):
    user_repository = providers.Factory(UserRepository)

    user_service = providers.Factory(
        UserService,
        user_repository=user_repository,
    )


container = Container()
