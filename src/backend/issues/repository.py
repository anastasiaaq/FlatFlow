from .models import Issue


class IssueRepository:
    def list_for_household(self, household):
        return list(
            Issue.objects.select_related("created_by")
            .filter(household=household)
            .order_by("-created_at", "-id")
        )

    def get_for_household(self, *, issue_id, household):
        return (
            Issue.objects.select_related("created_by")
            .filter(pk=issue_id, household=household)
            .first()
        )

    def get_for_update(self, *, issue_id, household):
        return (
            Issue.objects.select_for_update()
            .filter(pk=issue_id, household=household)
            .first()
        )

    def create(self, *, household, title, description, created_by):
        return Issue.objects.create(
            household=household,
            title=title,
            description=description,
            created_by=created_by,
        )

    def save(self, issue):
        issue.save()
        return issue

    def delete(self, issue):
        issue.delete()
