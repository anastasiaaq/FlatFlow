from rest_framework import serializers


class RuleMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.CharField(read_only=True)


class RuleWriteSerializer(serializers.Serializer):
    text = serializers.CharField(
        max_length=280,
        min_length=1,
        trim_whitespace=True,
    )


class RuleDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    last_modified_at = serializers.DateTimeField(read_only=True)
    created_by = RuleMemberSerializer(read_only=True)
    last_modified_by = RuleMemberSerializer(read_only=True, allow_null=True)
