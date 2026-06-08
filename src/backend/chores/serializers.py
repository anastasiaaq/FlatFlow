from rest_framework import serializers

from .models import ChoreStatus, ChoreType
from .statuses import ChoreDisplayStatus


class ChoreMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.CharField(read_only=True)


class ChoreCreateSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=ChoreType.choices)
    title = serializers.CharField(
        max_length=80,
        min_length=1,
        trim_whitespace=True,
    )
    description = serializers.CharField(
        max_length=500,
        allow_blank=True,
        required=False,
        default="",
        trim_whitespace=True,
    )
    assignee_id = serializers.IntegerField(
        allow_null=True,
        required=False,
        default=None,
    )
    due_date = serializers.DateField(allow_null=True, required=False)
    start_date = serializers.DateField(allow_null=True, required=False)
    end_date = serializers.DateField(allow_null=True, required=False)

    def validate(self, attrs):
        chore_type = attrs.get("type")
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        due_date = attrs.get("due_date")
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
            raise serializers.ValidationError(errors)
        return attrs


class ChoreUpdateSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=ChoreType.choices, required=False)
    title = serializers.CharField(
        max_length=80,
        min_length=1,
        trim_whitespace=True,
        required=False,
    )
    description = serializers.CharField(
        max_length=500,
        allow_blank=True,
        trim_whitespace=True,
        required=False,
    )
    assignee_id = serializers.IntegerField(allow_null=True, required=False)
    due_date = serializers.DateField(allow_null=True, required=False)
    start_date = serializers.DateField(allow_null=True, required=False)
    end_date = serializers.DateField(allow_null=True, required=False)
    status = serializers.ChoiceField(choices=ChoreStatus.choices, required=False)

    def _existing_value(self, field):
        if self.instance is None:
            return None
        return getattr(self.instance, field, None)

    def validate(self, attrs):
        chore_type = attrs.get("type") or self._existing_value("type")
        start_date = attrs.get("start_date", self._existing_value("start_date"))
        end_date = attrs.get("end_date", self._existing_value("end_date"))
        due_date = attrs.get("due_date", self._existing_value("due_date"))
        errors = {}

        if chore_type == ChoreType.TASK:
            if start_date is not None:
                errors["start_date"] = ["Tasks do not have a start date."]
            if end_date is not None:
                errors["end_date"] = ["Tasks do not have an end date."]

        if chore_type == ChoreType.DUTY:
            if due_date is not None:
                errors["due_date"] = ["Duties do not have a due date."]
            if (
                start_date is not None
                and end_date is not None
                and end_date < start_date
            ):
                errors["end_date"] = ["End date must be on or after start date."]

        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class ChoreFilterSerializer(serializers.Serializer):
    assignee = serializers.CharField(required=False, default="any")
    status = serializers.CharField(required=False, default="all")
    sort = serializers.CharField(required=False, default="default")

    def validate_assignee(self, value):
        value = str(value).strip()
        if value == "":
            return "any"

        normalized = value.lower()
        if normalized in {"any", "all", "me", "unassigned"}:
            return "any" if normalized == "all" else normalized
        if normalized.isdigit():
            return normalized
        raise serializers.ValidationError(
            "Use any, me, unassigned, or a household member id."
        )

    def validate_status(self, value):
        normalized = str(value).strip().lower()
        if normalized == "":
            return "all"

        normalized = normalized.replace("-", "_")
        valid_statuses = {
            "all",
            "active",
            "completed",
            "overdue",
            "pending_confirmation",
        }
        if normalized not in valid_statuses:
            raise serializers.ValidationError(
                "Use all, active, completed, overdue, or pending_confirmation."
            )
        return normalized

    def validate_sort(self, value):
        normalized = str(value).strip().lower()
        if normalized == "":
            return "default"

        descending = normalized.startswith("-")
        field = normalized[1:] if descending else normalized
        valid_fields = {
            "default",
            "date",
            "title",
            "status",
            "created_at",
            "updated_at",
        }
        if field not in valid_fields:
            raise serializers.ValidationError(
                "Use default, date, title, status, created_at, or updated_at."
            )
        if field == "default":
            return "default"
        return f"-{field}" if descending else field


class ChoreDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    type = serializers.ChoiceField(choices=ChoreType.choices, read_only=True)
    title = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    status = serializers.ChoiceField(
        choices=ChoreDisplayStatus.choices,
        read_only=True,
    )
    stored_status = serializers.ChoiceField(
        choices=ChoreStatus.choices,
        read_only=True,
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    due_date = serializers.DateField(allow_null=True, read_only=True)
    start_date = serializers.DateField(allow_null=True, read_only=True)
    end_date = serializers.DateField(allow_null=True, read_only=True)
    completed_at = serializers.DateTimeField(allow_null=True, read_only=True)
    created_by = ChoreMemberSerializer(read_only=True)
    assignee = ChoreMemberSerializer(allow_null=True, read_only=True)
    completed_by = ChoreMemberSerializer(allow_null=True, read_only=True)
