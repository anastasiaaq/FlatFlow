from django.db import transaction

from households.exceptions import NotInHouseholdError
from households.repository import HouseholdRepository

from .dtos import RuleCreateRequest, RuleUpdateRequest, RuleView
from .exceptions import RuleNotFoundError
from .repository import RuleRepository


class RuleService:
    def __init__(
        self,
        rule_repository: RuleRepository,
        household_repository: HouseholdRepository,
    ):
        self.rule_repository = rule_repository
        self.household_repository = household_repository

    def _require_household(self, user):
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()
        return membership.household

    def _member_ids(self, household):
        return self.rule_repository.list_member_ids(household)

    def _to_view(self, rule, household) -> RuleView:
        return RuleView.from_rule(rule, self._member_ids(household))

    def list_rules(self, user) -> list[RuleView]:
        household = self._require_household(user)
        rules = self.rule_repository.list_for_household(household)
        member_ids = self._member_ids(household)
        return [RuleView.from_rule(rule, member_ids) for rule in rules]

    def create_rule(self, user, payload: RuleCreateRequest) -> RuleView:
        household = self._require_household(user)
        rule = self.rule_repository.create(
            household=household,
            text=payload.text.strip(),
            created_by=user,
        )
        return self._to_view(rule, household)

    def update_rule(
        self, user, rule_id: int, payload: RuleUpdateRequest
    ) -> RuleView:
        household = self._require_household(user)
        with transaction.atomic():
            rule = self.rule_repository.get_for_update(
                rule_id=rule_id, household=household
            )
            if rule is None:
                raise RuleNotFoundError()
            rule.text = payload.text.strip()
            rule.last_modified_by = user
            self.rule_repository.save(rule)
        return self._to_view(rule, household)

    def delete_rule(self, user, rule_id: int) -> None:
        household = self._require_household(user)
        rule = self.rule_repository.get_for_household(
            rule_id=rule_id, household=household
        )
        if rule is None:
            raise RuleNotFoundError()
        self.rule_repository.delete(rule)
