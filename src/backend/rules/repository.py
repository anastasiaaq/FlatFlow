from .models import Rule


class RuleRepository:
    def list_for_household(self, household):
        # US-5.2: chronological order, new rules appended at the bottom.
        return list(
            Rule.objects.select_related("created_by", "last_modified_by")
            .filter(household=household)
            .order_by("created_at", "id")
        )

    def get_for_household(self, *, rule_id, household):
        return (
            Rule.objects.select_related("created_by", "last_modified_by")
            .filter(pk=rule_id, household=household)
            .first()
        )

    def get_for_update(self, *, rule_id, household):
        # Lock the row so a concurrent edit of the same rule can't act on a stale read.
        return (
            Rule.objects.select_for_update()
            .filter(pk=rule_id, household=household)
            .first()
        )

    def create(self, *, household, text, created_by):
        return Rule.objects.create(
            household=household,
            text=text,
            created_by=created_by,
        )

    def list_member_ids(self, household):
        return set(household.memberships.values_list("user_id", flat=True))

    def save(self, rule):
        rule.save()
        return rule

    def delete(self, rule):
        rule.delete()
