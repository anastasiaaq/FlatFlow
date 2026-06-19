from dataclasses import dataclass
from datetime import datetime


@dataclass
class IssueCreateRequest:
    title: str
    description: str


@dataclass
class IssueUpdateRequest:
    title: str
    description: str
    status: str


@dataclass
class IssueMemberView:
    id: int
    display_name: str

    @classmethod
    def from_user(cls, user) -> "IssueMemberView":
        return cls(id=user.id, display_name=user.display_name)


@dataclass
class IssueView:
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: IssueMemberView

    @classmethod
    def from_issue(cls, issue) -> "IssueView":
        return cls(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            status=issue.status,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            created_by=IssueMemberView.from_user(issue.created_by),
        )
