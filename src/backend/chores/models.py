from django.conf import settings
from django.db import models


class ChoreType(models.TextChoices):
    TASK = "TASK", "Task"
    DUTY = "DUTY", "Duty"


class ChoreStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    COMPLETED = "COMPLETED", "Completed"


class Chore(models.Model):
    household = models.ForeignKey(
        "households.Household",
        on_delete=models.CASCADE,
        related_name="chores",
    )
    type = models.CharField(max_length=4, choices=ChoreType.choices)
    title = models.CharField(max_length=80)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=9,
        choices=ChoreStatus.choices,
        default=ChoreStatus.ACTIVE,
    )

    due_date = models.DateField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="completed_chores",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_chores",
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_chores",
    )

    def __str__(self):
        return self.title
