from django.conf import settings
from django.db import models


class Rule(models.Model):
    household = models.ForeignKey(
        "households.Household",
        on_delete=models.CASCADE,
        related_name="rules",
    )
    text = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_rules",
    )
    last_modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="modified_rules",
    )

    def __str__(self):
        return self.text[:50]
