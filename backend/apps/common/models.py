from django.db import models
from django.conf import settings

# Create your models here.


User = settings.AUTH_USER_MODEL


class AuditLog(models.Model):
    """
    Stores audit trail of system actions.

    This is critical for:
    - Debugging
    - Accountability
    - Compliance
    """

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        help_text="User who performed the action"
    )

    action = models.CharField(
        max_length=100,
        help_text="Action performed (e.g., 'SUBMIT_LOG', 'APPROVE_LOG')"
    )

    object_type = models.CharField(
        max_length=100,
        help_text="Model name (e.g., 'WeeklyLog')"
    )

    object_id = models.PositiveIntegerField(
        help_text="ID of the affected object"
    )

    previous_state = models.JSONField(
        null=True,
        blank=True,
        help_text="State before change"
    )

    new_state = models.JSONField(
        null=True,
        blank=True,
        help_text="State after change"
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} by {self.user} on {self.object_type} ({self.object_id})"