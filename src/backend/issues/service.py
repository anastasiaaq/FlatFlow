from django.db import transaction

from households.exceptions import NotInHouseholdError
from households.repository import HouseholdRepository

from .dtos import IssueCreateRequest, IssueUpdateRequest, IssueView
from .exceptions import IssueNotFoundError
from .repository import IssueRepository


class IssueService:
    def __init__(
        self,
        issue_repository: IssueRepository,
        household_repository: HouseholdRepository,
    ):
        self.issue_repository = issue_repository
        self.household_repository = household_repository

    def _require_household(self, user):
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()
        return membership.household

    def list_issues(self, user) -> list[IssueView]:
        household = self._require_household(user)
        issues = self.issue_repository.list_for_household(household)
        return [IssueView.from_issue(issue) for issue in issues]

    def create_issue(self, user, payload: IssueCreateRequest) -> IssueView:
        household = self._require_household(user)
        issue = self.issue_repository.create(
            household=household,
            title=payload.title.strip(),
            description=payload.description.strip(),
            created_by=user,
        )
        return IssueView.from_issue(issue)

    def update_issue(
        self, user, issue_id: int, payload: IssueUpdateRequest
    ) -> IssueView:
        household = self._require_household(user)
        with transaction.atomic():
            issue = self.issue_repository.get_for_update(
                issue_id=issue_id, household=household
            )
            if issue is None:
                raise IssueNotFoundError()
            issue.title = payload.title.strip()
            issue.description = payload.description.strip()
            issue.status = payload.status
            self.issue_repository.save(issue)
        return IssueView.from_issue(issue)

    def delete_issue(self, user, issue_id: int) -> None:
        household = self._require_household(user)
        issue = self.issue_repository.get_for_household(
            issue_id=issue_id, household=household
        )
        if issue is None:
            raise IssueNotFoundError()
        self.issue_repository.delete(issue)
