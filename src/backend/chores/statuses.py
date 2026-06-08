from django.db import models


class ChoreDisplayStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    COMPLETED = "COMPLETED", "Completed"
    OVERDUE = "OVERDUE", "Overdue"
    PENDING_CONFIRMATION = (
        "PENDING_CONFIRMATION",
        "Pending confirmation",
    )
