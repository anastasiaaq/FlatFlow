from dependency_injector import containers, providers

from accounts.repository import UserRepository
from accounts.service import UserService
from chores.repository import ChoreRepository
from chores.service import ChoreService
from households.repository import HouseholdRepository
from households.service import HouseholdService
from issues.repository import IssueRepository
from issues.service import IssueService
from rules.repository import RuleRepository
from rules.service import RuleService


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

    chore_repository = providers.Factory(ChoreRepository)

    chore_service = providers.Factory(
        ChoreService,
        chore_repository=chore_repository,
        household_repository=household_repository,
    )

    rule_repository = providers.Factory(RuleRepository)

    rule_service = providers.Factory(
        RuleService,
        rule_repository=rule_repository,
        household_repository=household_repository,
    )

    issue_repository = providers.Factory(IssueRepository)

    issue_service = providers.Factory(
        IssueService,
        issue_repository=issue_repository,
        household_repository=household_repository,
    )


container = Container()
