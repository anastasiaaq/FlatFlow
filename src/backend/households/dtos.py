from dataclasses import dataclass
from datetime import datetime


@dataclass
class HouseholdCreateRequest:
    name: str


@dataclass
class HouseholdJoinRequest:
    invite_code: str


@dataclass
class LeaveResult:
    household_deleted: bool


@dataclass
class HouseholdMemberView:
    id: int
    display_name: str

    @classmethod
    def from_user(cls, user) -> "HouseholdMemberView":
        return cls(id=user.id, display_name=user.display_name)


@dataclass
class HouseholdView:
    id: int
    name: str
    invite_code: str
    created_at: datetime
    created_by: HouseholdMemberView
    members: list[HouseholdMemberView]

    @classmethod
    def from_household(cls, household, members) -> "HouseholdView":
        return cls(
            id=household.id,
            name=household.name,
            invite_code=household.invite_code,
            created_at=household.created_at,
            created_by=HouseholdMemberView.from_user(household.created_by),
            members=[HouseholdMemberView.from_user(m) for m in members],
        )
