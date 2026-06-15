from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class IssueCreateRequest:
    title: str
    description: str


@dataclass
class IssueUpdateRequest:
    fields: dict[str, Any]


@dataclass
class IssueListRequest:
    status: str = "all"


@dataclass
class IssueAuthorView:
    id: int
    display_name: str

    @classmethod
    def from_user(cls, user, member_ids) -> "IssueAuthorView":
        display_name = user.display_name
        if user.id not in member_ids:
            display_name = f"[former member] {display_name}"
        return cls(id=user.id, display_name=display_name)


@dataclass
class IssueView:
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: IssueAuthorView

    @classmethod
    def from_issue(cls, issue, member_ids) -> "IssueView":
        return cls(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            status=issue.status,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            created_by=IssueAuthorView.from_user(issue.created_by, member_ids),
        )
