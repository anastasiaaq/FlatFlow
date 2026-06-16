from dataclasses import dataclass
from datetime import datetime


@dataclass
class RuleCreateRequest:
    text: str


@dataclass
class RuleUpdateRequest:
    text: str


@dataclass
class RuleMemberView:
    id: int
    display_name: str
    is_current_member: bool

    @classmethod
    def from_user(cls, user, member_ids) -> "RuleMemberView":
        return cls(
            id=user.id,
            display_name=user.display_name,
            is_current_member=user.id in member_ids,
        )


@dataclass
class RuleView:
    id: int
    text: str
    created_at: datetime
    last_modified_at: datetime
    created_by: RuleMemberView
    last_modified_by: RuleMemberView | None

    @classmethod
    def from_rule(cls, rule, member_ids) -> "RuleView":
        return cls(
            id=rule.id,
            text=rule.text,
            created_at=rule.created_at,
            last_modified_at=rule.last_modified_at,
            created_by=RuleMemberView.from_user(rule.created_by, member_ids),
            last_modified_by=(
                RuleMemberView.from_user(rule.last_modified_by, member_ids)
                if rule.last_modified_by is not None
                else None
            ),
        )
