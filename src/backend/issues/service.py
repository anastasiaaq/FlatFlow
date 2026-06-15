from django.db import transaction

from households.exceptions import NotInHouseholdError
from households.repository import HouseholdRepository

from .dtos import IssueCreateRequest, IssueListRequest, IssueUpdateRequest, IssueView
from .exceptions import IssueNotFoundError, NotIssueAuthorError
from .models import IssueStatus
from .repository import IssueRepository


class IssueService:
    def __init__(
        self,
        issue_repository: IssueRepository,
        household_repository: HouseholdRepository,
    ):
        self.issue_repository = issue_repository
        self.household_repository = household_repository

    def _current_household(self, user):
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()
        return membership.household

    def _member_ids(self, household):
        return self.issue_repository.list_member_ids(household)

    def _to_view(self, issue, household):
        return IssueView.from_issue(issue, self._member_ids(household))

    def _issue_id(self, value):
        try:
            return int(value)
        except (TypeError, ValueError) as err:
            raise IssueNotFoundError() from err

    def create_issue(self, user, payload: IssueCreateRequest) -> IssueView:
        household = self._current_household(user)
        issue = self.issue_repository.create_issue(
            household=household,
            title=payload.title.strip(),
            description=payload.description.strip(),
            status=IssueStatus.OPEN,
            created_by=user,
        )
        return self._to_view(issue, household)

    def get_issue(self, user, issue_id) -> IssueView:
        household = self._current_household(user)
        issue = self.issue_repository.get_household_issue(
            household=household,
            issue_id=self._issue_id(issue_id),
        )
        if issue is None:
            raise IssueNotFoundError()
        return self._to_view(issue, household)

    def list_issues(self, user, payload: IssueListRequest) -> list[IssueView]:
        household = self._current_household(user)
        member_ids = self._member_ids(household)
        issues = list(self.issue_repository.list_household_issues(household))

        issues = self._filter_by_status(issues, payload.status)
        issues = self._sort_issues(issues)

        return [IssueView.from_issue(issue, member_ids) for issue in issues]

    def _filter_by_status(self, issues, status_filter):
        if status_filter == "all":
            return issues

        requested = {
            "open": IssueStatus.OPEN,
            "resolved": IssueStatus.RESOLVED,
        }[status_filter]
        return [issue for issue in issues if issue.status == requested]

    def _sort_issues(self, issues):
        # Stable two-pass sort: newest-first, then open before resolved (US-4.2).
        issues = sorted(
            issues,
            key=lambda issue: (issue.created_at, issue.id),
            reverse=True,
        )
        issues.sort(key=lambda issue: 0 if issue.status == IssueStatus.OPEN else 1)
        return issues

    def update_issue(self, user, issue_id, payload: IssueUpdateRequest) -> IssueView:
        household = self._current_household(user)

        with transaction.atomic():
            issue = self.issue_repository.get_household_issue_for_update(
                household=household,
                issue_id=self._issue_id(issue_id),
            )
            if issue is None:
                raise IssueNotFoundError()
            if issue.created_by_id != user.id:
                raise NotIssueAuthorError()

            update_fields = []
            for field in ["title", "description"]:
                if field in payload.fields:
                    setattr(issue, field, payload.fields[field].strip())
                    update_fields.append(field)
            if update_fields:
                self.issue_repository.save_issue(issue, update_fields)

        return self._to_view(issue, household)

    def toggle_status(self, user, issue_id) -> IssueView:
        household = self._current_household(user)

        with transaction.atomic():
            issue = self.issue_repository.get_household_issue_for_update(
                household=household,
                issue_id=self._issue_id(issue_id),
            )
            if issue is None:
                raise IssueNotFoundError()

            issue.status = (
                IssueStatus.RESOLVED
                if issue.status == IssueStatus.OPEN
                else IssueStatus.OPEN
            )
            self.issue_repository.save_issue(issue, ["status"])

        return self._to_view(issue, household)

    def delete_issue(self, user, issue_id):
        household = self._current_household(user)

        with transaction.atomic():
            issue = self.issue_repository.get_household_issue_for_update(
                household=household,
                issue_id=self._issue_id(issue_id),
            )
            if issue is None:
                raise IssueNotFoundError()
            if issue.created_by_id != user.id:
                raise NotIssueAuthorError()
            self.issue_repository.delete_issue(issue)
