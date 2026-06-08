from datetime import date

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from households.exceptions import NotInHouseholdError
from households.repository import HouseholdRepository

from .dtos import ChoreCreateRequest, ChoreListRequest, ChoreUpdateRequest, ChoreView
from .exceptions import ChoreNotFoundError, DutyCannotCompleteBeforeStartError
from .models import ChoreStatus, ChoreType
from .repository import ChoreRepository
from .statuses import ChoreDisplayStatus


class ChoreService:
    def __init__(
        self,
        chore_repository: ChoreRepository,
        household_repository: HouseholdRepository,
    ):
        self.chore_repository = chore_repository
        self.household_repository = household_repository

    def _current_household(self, user):
        membership = self.household_repository.get_membership(user)
        if membership is None:
            raise NotInHouseholdError()
        return membership.household

    def _resolve_assignee(self, household, assignee_id):
        if assignee_id is None:
            return None

        assignee = self.chore_repository.get_household_member(
            household=household,
            user_id=assignee_id,
        )
        if assignee is None:
            raise ValidationError(
                {"assignee_id": ["Assignee must be a current household member."]}
            )
        return assignee

    def _member_ids(self, household):
        return self.chore_repository.list_member_ids(household)

    def _to_view(self, chore, household, today=None):
        today = today or timezone.localdate()
        return ChoreView.from_chore(
            chore,
            self._member_ids(household),
            self._effective_status(chore, today).value,
        )

    def _effective_status(self, chore, today):
        if chore.status == ChoreStatus.COMPLETED:
            return ChoreDisplayStatus.COMPLETED
        if (
            chore.type == ChoreType.TASK
            and chore.due_date is not None
            and chore.due_date < today
        ):
            return ChoreDisplayStatus.OVERDUE
        if (
            chore.type == ChoreType.DUTY
            and chore.end_date is not None
            and chore.end_date < today
        ):
            return ChoreDisplayStatus.PENDING_CONFIRMATION
        return ChoreDisplayStatus.ACTIVE

    def _chore_id(self, value):
        try:
            return int(value)
        except (TypeError, ValueError) as err:
            raise ChoreNotFoundError() from err

    def _validate_schedule(self, *, chore_type, due_date, start_date, end_date):
        errors = {}

        if chore_type == ChoreType.TASK:
            if start_date is not None:
                errors["start_date"] = ["Tasks do not have a start date."]
            if end_date is not None:
                errors["end_date"] = ["Tasks do not have an end date."]

        if chore_type == ChoreType.DUTY:
            if due_date is not None:
                errors["due_date"] = ["Duties do not have a due date."]
            if start_date is None:
                errors["start_date"] = ["Duties require a start date."]
            if end_date is None:
                errors["end_date"] = ["Duties require an end date."]
            if (
                start_date is not None
                and end_date is not None
                and end_date < start_date
            ):
                errors["end_date"] = ["End date must be on or after start date."]

        if errors:
            raise ValidationError(errors)

    def create_chore(self, user, payload: ChoreCreateRequest) -> ChoreView:
        household = self._current_household(user)
        assignee = self._resolve_assignee(household, payload.assignee_id)
        self._validate_schedule(
            chore_type=payload.type,
            due_date=payload.due_date,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )

        chore = self.chore_repository.create_chore(
            household=household,
            type=payload.type,
            title=payload.title.strip(),
            description=payload.description.strip(),
            status=ChoreStatus.ACTIVE,
            due_date=payload.due_date if payload.type == ChoreType.TASK else None,
            start_date=payload.start_date if payload.type == ChoreType.DUTY else None,
            end_date=payload.end_date if payload.type == ChoreType.DUTY else None,
            created_by=user,
            assignee=assignee,
        )
        return self._to_view(chore, household)

    def get_chore(self, user, chore_id) -> ChoreView:
        household = self._current_household(user)
        chore = self.chore_repository.get_household_chore(
            household=household,
            chore_id=self._chore_id(chore_id),
        )
        if chore is None:
            raise ChoreNotFoundError()
        return self._to_view(chore, household)

    def list_chores(self, user, payload: ChoreListRequest) -> list[ChoreView]:
        household = self._current_household(user)
        today = timezone.localdate()
        member_ids = self._member_ids(household)
        chores = list(self.chore_repository.list_household_chores(household))

        chores = self._filter_by_assignee(
            chores=chores,
            household=household,
            user=user,
            assignee_filter=payload.assignee,
        )
        chores = self._filter_by_status(
            chores=chores,
            status_filter=payload.status,
            today=today,
        )
        chores = self._sort_chores(chores, payload.sort, today)

        return [
            ChoreView.from_chore(
                chore,
                member_ids,
                self._effective_status(chore, today).value,
            )
            for chore in chores
        ]

    def _filter_by_assignee(self, *, chores, household, user, assignee_filter):
        if assignee_filter == "any":
            return chores
        if assignee_filter == "me":
            return [chore for chore in chores if chore.assignee_id == user.id]
        if assignee_filter == "unassigned":
            return [chore for chore in chores if chore.assignee_id is None]

        assignee_id = int(assignee_filter)
        if (
            self.chore_repository.get_household_member(
                household=household,
                user_id=assignee_id,
            )
            is None
        ):
            raise ValidationError(
                {"assignee": ["Assignee must be a current household member."]}
            )
        return [chore for chore in chores if chore.assignee_id == assignee_id]

    def _filter_by_status(self, *, chores, status_filter, today):
        if status_filter == "all":
            return chores

        status_map = {
            "active": ChoreDisplayStatus.ACTIVE,
            "completed": ChoreDisplayStatus.COMPLETED,
            "overdue": ChoreDisplayStatus.OVERDUE,
            "pending_confirmation": ChoreDisplayStatus.PENDING_CONFIRMATION,
        }
        requested_status = status_map[status_filter]
        return [
            chore
            for chore in chores
            if self._effective_status(chore, today) == requested_status
        ]

    def _sort_chores(self, chores, sort, today):
        if sort == "default":
            return sorted(chores, key=lambda chore: self._default_sort_key(chore, today))

        descending = sort.startswith("-")
        field = sort[1:] if descending else sort
        return sorted(
            chores,
            key=lambda chore: self._field_sort_key(chore, field, today),
            reverse=descending,
        )

    def _default_sort_key(self, chore, today):
        status = self._effective_status(chore, today)
        if status == ChoreDisplayStatus.OVERDUE:
            category = 0
        elif status == ChoreDisplayStatus.PENDING_CONFIRMATION:
            category = 1
        elif status == ChoreDisplayStatus.COMPLETED:
            category = 5
        elif (
            chore.type == ChoreType.DUTY
            and chore.start_date is not None
            and chore.end_date is not None
            and chore.start_date <= today <= chore.end_date
        ):
            category = 2
        else:
            category = 3

        return (
            category,
            self._relevant_date(chore, today),
            chore.title.lower(),
            chore.id,
        )

    def _field_sort_key(self, chore, field, today):
        if field == "date":
            return (self._relevant_date(chore, today), chore.id)
        if field == "title":
            return (chore.title.lower(), chore.id)
        if field == "status":
            return (
                self._status_sort_value(self._effective_status(chore, today)),
                chore.title.lower(),
                chore.id,
            )
        if field == "created_at":
            return (chore.created_at, chore.id)
        if field == "updated_at":
            return (chore.updated_at, chore.id)
        return self._default_sort_key(chore, today)

    def _status_sort_value(self, status):
        return {
            ChoreDisplayStatus.OVERDUE: 0,
            ChoreDisplayStatus.PENDING_CONFIRMATION: 1,
            ChoreDisplayStatus.ACTIVE: 2,
            ChoreDisplayStatus.COMPLETED: 3,
        }[status]

    def _relevant_date(self, chore, today):
        if chore.type == ChoreType.TASK:
            return chore.due_date or date.max
        if chore.start_date is not None and chore.start_date > today:
            return chore.start_date
        return chore.end_date or chore.start_date or date.max

    def update_chore(self, user, chore_id, payload: ChoreUpdateRequest) -> ChoreView:
        household = self._current_household(user)

        with transaction.atomic():
            chore = self.chore_repository.get_household_chore_for_update(
                household=household,
                chore_id=self._chore_id(chore_id),
            )
            if chore is None:
                raise ChoreNotFoundError()

            update_fields = self._apply_update_fields(
                chore=chore,
                household=household,
                user=user,
                fields=payload.fields,
            )
            if update_fields:
                self.chore_repository.save_chore(chore, update_fields)

        return self._to_view(chore, household)

    def _apply_update_fields(self, *, chore, household, user, fields):
        if "type" in fields and fields["type"] != chore.type:
            raise ValidationError({"type": ["Chore type cannot be changed."]})

        due_date = fields.get("due_date", chore.due_date)
        start_date = fields.get("start_date", chore.start_date)
        end_date = fields.get("end_date", chore.end_date)
        self._validate_schedule(
            chore_type=chore.type,
            due_date=due_date,
            start_date=start_date,
            end_date=end_date,
        )

        update_fields = []
        for field in ["title", "description", "due_date", "start_date", "end_date"]:
            if field in fields:
                setattr(chore, field, fields[field])
                update_fields.append(field)

        if "assignee_id" in fields:
            chore.assignee = self._resolve_assignee(household, fields["assignee_id"])
            update_fields.append("assignee")

        if "status" in fields:
            self._apply_status_update(chore, user, fields["status"], update_fields)

        return update_fields

    def _apply_status_update(self, chore, user, status, update_fields):
        if status == ChoreStatus.ACTIVE:
            chore.status = ChoreStatus.ACTIVE
            chore.completed_at = None
            chore.completed_by = None
            update_fields.extend(["status", "completed_at", "completed_by"])
            return

        if status == ChoreStatus.COMPLETED and chore.status != ChoreStatus.COMPLETED:
            self._complete_chore_fields(chore, user)
            update_fields.extend(["status", "completed_at", "completed_by"])

    def complete_chore(self, user, chore_id) -> ChoreView:
        household = self._current_household(user)

        with transaction.atomic():
            chore = self.chore_repository.get_household_chore_for_update(
                household=household,
                chore_id=self._chore_id(chore_id),
            )
            if chore is None:
                raise ChoreNotFoundError()

            if chore.status != ChoreStatus.COMPLETED:
                self._complete_chore_fields(chore, user)
                self.chore_repository.save_chore(
                    chore,
                    ["status", "completed_at", "completed_by"],
                )

        return self._to_view(chore, household)

    def _complete_chore_fields(self, chore, user):
        today = timezone.localdate()
        if (
            chore.type == ChoreType.DUTY
            and chore.start_date is not None
            and today < chore.start_date
        ):
            raise DutyCannotCompleteBeforeStartError()

        chore.status = ChoreStatus.COMPLETED
        chore.completed_at = timezone.now()
        chore.completed_by = user

    def delete_chore(self, user, chore_id):
        household = self._current_household(user)

        with transaction.atomic():
            chore = self.chore_repository.get_household_chore_for_update(
                household=household,
                chore_id=self._chore_id(chore_id),
            )
            if chore is None:
                raise ChoreNotFoundError()
            self.chore_repository.delete_chore(chore)
