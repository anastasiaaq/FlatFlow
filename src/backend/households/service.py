import secrets

from django.db import IntegrityError, transaction

from .dtos import HouseholdCreateRequest, HouseholdJoinRequest, LeaveResult
from .exceptions import (
    AlreadyInHouseholdError,
    AlreadyInThisHouseholdError,
    CannotCreateWhileInHouseholdError,
    InviteCodeNotFoundError,
    NotInHouseholdError,
)
from .repository import HouseholdRepository


# Unambiguous alphabet (no 0/O/1/I/L) for readable, shareable codes.
INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
INVITE_CODE_LENGTH = 12
INVITE_CODE_MAX_ATTEMPTS = 10


class HouseholdService:
    def __init__(self, household_repository: HouseholdRepository):
        self.household_repository = household_repository

    def _generate_invite_code(self):
        for _ in range(INVITE_CODE_MAX_ATTEMPTS):
            code = "".join(
                secrets.choice(INVITE_CODE_ALPHABET)
                for _ in range(INVITE_CODE_LENGTH)
            )
            if not self.household_repository.invite_code_exists(code):
                return code
        raise RuntimeError("Could not generate a unique invite code.")

    def get_current_household(self, user):
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()
        return membership.household

    def list_members(self, household):
        return self.household_repository.list_members(household)

    def create_household(self, user, request: HouseholdCreateRequest):
        if self.household_repository.get_membership(user) is not None:
            raise CannotCreateWhileInHouseholdError()

        invite_code = self._generate_invite_code()
        try:
            with transaction.atomic():
                household = self.household_repository.create_household(
                    name=request.name.strip(),
                    created_by=user,
                    invite_code=invite_code,
                )
                self.household_repository.create_membership(
                    user=user, household=household
                )
        except IntegrityError as err:
            # A concurrent create won the single-household race.
            raise CannotCreateWhileInHouseholdError() from err
        return household

    def join_household(self, user, request: HouseholdJoinRequest):
        household = self.household_repository.get_by_invite_code(request.invite_code)
        if household is None:
            raise InviteCodeNotFoundError()

        membership = self.household_repository.get_membership(user)
        if membership is not None:
            if membership.household_id == household.id:
                raise AlreadyInThisHouseholdError()
            raise AlreadyInHouseholdError()

        try:
            with transaction.atomic():
                self.household_repository.create_membership(
                    user=user, household=household
                )
        except IntegrityError as err:
            # A concurrent join created the membership first.
            raise AlreadyInHouseholdError() from err
        return household

    def leave_household(self, user) -> LeaveResult:
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()

        with transaction.atomic():
            household = self.household_repository.get_household_for_update(
                membership.household_id
            )
            is_last_member = self.household_repository.count_members(household) == 1
            self.household_repository.unassign_member_chores(
                household=household, user=user
            )
            self.household_repository.delete_membership(membership)
            if is_last_member:
                self.household_repository.delete_household(household)
        return LeaveResult(household_deleted=is_last_member)
