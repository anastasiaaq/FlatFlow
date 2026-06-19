from rest_framework import serializers

from .models import IssueStatus


class IssueMemberSerializer(serializers.Serializer):
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


class IssueUpdateSerializer(IssueCreateSerializer):
    status = serializers.ChoiceField(choices=IssueStatus.choices)


class IssueDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = IssueMemberSerializer(read_only=True)
