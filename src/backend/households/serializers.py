from rest_framework import serializers


class MemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.CharField(read_only=True)


class HouseholdCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=60,
        min_length=1,
        trim_whitespace=True,
    )


class HouseholdJoinSerializer(serializers.Serializer):
    invite_code = serializers.CharField(
        max_length=12,
        min_length=1,
        trim_whitespace=True,
    )

    def validate_invite_code(self, value):
        return value.strip().upper()


class HouseholdDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    invite_code = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    created_by = MemberSerializer(read_only=True)
    members = MemberSerializer(many=True, read_only=True)


class LeaveResultSerializer(serializers.Serializer):
    household_deleted = serializers.BooleanField(read_only=True)
