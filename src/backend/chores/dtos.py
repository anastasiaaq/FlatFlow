from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


@dataclass
class ChoreCreateRequest:
    type: str
    title: str
    description: str = ""
    assignee_id: int | None = None
    due_date: date | None = None
    start_date: date | None = None
    end_date: date | None = None


@dataclass
class ChoreUpdateRequest:
    fields: dict[str, Any]


@dataclass
class ChoreListRequest:
    assignee: str = "any"
    status: str = "all"
    sort: str = "default"


@dataclass
class ChoreMemberView:
    id: int
    display_name: str

    @classmethod
    def from_user(cls, user, member_ids) -> "ChoreMemberView":
        display_name = user.display_name
        if user.id not in member_ids:
            display_name = f"[former member] {display_name}"
        return cls(id=user.id, display_name=display_name)


@dataclass
class ChoreView:
    id: int
    type: str
    title: str
    description: str
    status: str
    stored_status: str
    created_at: datetime
    updated_at: datetime
    due_date: date | None
    start_date: date | None
    end_date: date | None
    completed_at: datetime | None
    created_by: ChoreMemberView
    assignee: ChoreMemberView | None
    completed_by: ChoreMemberView | None

    @classmethod
    def from_chore(cls, chore, member_ids, display_status) -> "ChoreView":
        assignee = None
        if chore.assignee is not None:
            assignee = ChoreMemberView.from_user(chore.assignee, member_ids)

        completed_by = None
        if chore.completed_by is not None:
            completed_by = ChoreMemberView.from_user(chore.completed_by, member_ids)

        return cls(
            id=chore.id,
            type=chore.type,
            title=chore.title,
            description=chore.description,
            status=display_status,
            stored_status=chore.status,
            created_at=chore.created_at,
            updated_at=chore.updated_at,
            due_date=chore.due_date,
            start_date=chore.start_date,
            end_date=chore.end_date,
            completed_at=chore.completed_at,
            created_by=ChoreMemberView.from_user(chore.created_by, member_ids),
            assignee=assignee,
            completed_by=completed_by,
        )
