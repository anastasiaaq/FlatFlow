from dataclasses import dataclass


@dataclass
class HouseholdCreateRequest:
    name: str


@dataclass
class HouseholdJoinRequest:
    invite_code: str


@dataclass
class LeaveResult:
    household_deleted: bool
