from dependency_injector import containers, providers

from accounts.repository import UserRepository
from accounts.service import UserService
from households.repository import HouseholdRepository
from households.service import HouseholdService


class Container(containers.DeclarativeContainer):
    user_repository = providers.Factory(UserRepository)

    user_service = providers.Factory(
        UserService,
        user_repository=user_repository,
    )

    household_repository = providers.Factory(HouseholdRepository)

    household_service = providers.Factory(
        HouseholdService,
        household_repository=household_repository,
    )


container = Container()
