from django.conf import settings
from django.db import models


class IssueStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    RESOLVED = "RESOLVED", "Resolved"


class Issue(models.Model):
    household = models.ForeignKey(
        "households.Household",
        on_delete=models.CASCADE,
        related_name="issues",
    )
    title = models.CharField(max_length=80)
    description = models.TextField()
    status = models.CharField(
        max_length=8,
        choices=IssueStatus.choices,
        default=IssueStatus.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_issues",
    )

    def __str__(self):
        return self.title
