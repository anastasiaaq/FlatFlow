from rest_framework import serializers

from .models import IssueStatus


class IssueAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.CharField(read_only=True)


class IssueCreateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=80,
        min_length=1,
        trim_whitespace=True,
    )
    description = serializers.CharField(
        max_length=1000,
        min_length=1,
        trim_whitespace=True,
    )


class IssueUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=80,
        min_length=1,
        trim_whitespace=True,
        required=False,
    )
    description = serializers.CharField(
        max_length=1000,
        min_length=1,
        trim_whitespace=True,
        required=False,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "At least one field must be provided."
            )
        return attrs


class IssueFilterSerializer(serializers.Serializer):
    status = serializers.CharField(required=False, default="all")

    def validate_status(self, value):
        normalized = str(value).strip().lower()
        if normalized == "":
            return "all"

        valid_statuses = {"all", "open", "resolved"}
        if normalized not in valid_statuses:
            raise serializers.ValidationError("Use all, open, or resolved.")
        return normalized


class IssueDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    status = serializers.ChoiceField(choices=IssueStatus.choices, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = IssueAuthorSerializer(read_only=True)
