from .models import Issue


class IssueRepository:
    def list_household_issues(self, household):
        return (
            Issue.objects.select_related("created_by")
            .filter(household=household)
            .order_by("id")
        )

    def get_household_issue(self, *, household, issue_id):
        return (
            Issue.objects.select_related("created_by")
            .filter(household=household, id=issue_id)
            .first()
        )

    def get_household_issue_for_update(self, *, household, issue_id):
        return (
            Issue.objects.select_for_update(of=("self",))
            .select_related("created_by")
            .filter(household=household, id=issue_id)
            .first()
        )

    def list_member_ids(self, household):
        return set(household.memberships.values_list("user_id", flat=True))

    def create_issue(self, **fields):
        return Issue.objects.create(**fields)

    def save_issue(self, issue, update_fields):
        fields = set(update_fields)
        fields.add("updated_at")
        issue.save(update_fields=list(fields))
        return issue

    def delete_issue(self, issue):
        issue.delete()
