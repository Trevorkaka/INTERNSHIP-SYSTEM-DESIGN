"""
Models for the Notifications application.

Defines the structure for system alerts and notifications pushed to users on events like:
- WeeklyLog assessment feedbacks
- Performance evaluations
- Supervisors reviewing or approving log reports
- Placement changes
"""

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Notification model representing in-app alert messages.

    Links back to original objects to allow quick redirection to the triggering event.

    Attributes:
        NOTIFICATION_TYPES (tuple of tuple): Registered categories of system notification.
        recipient (ForeignKey): User receiving the notification (legacy field).
        user (ForeignKey): User receiving the notification (standard field).
        notification_type (CharField): Registered category.
        title (CharField): Subject line.
        message (TextField): Body text.
        assessment (ForeignKey): Evaluated log feedback link.
        evaluation (ForeignKey): Term evaluation feedback link.
        weekly_log (ForeignKey): Log status update link.
        is_read (BooleanField): Read status flag.
        created_at (DateTimeField): Notification creation timestamp.
    """
    NOTIFICATION_TYPES = (
        ('assessment', 'Assessment Feedback'),
        ('evaluation', 'Evaluation Feedback'),
        ('log_reviewed', 'Log Reviewed'),
        ('log_approved', 'Log Approved'),
        ('placement', 'Placement Update'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='internship_notifications',
        null=True, blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, blank=True, null=True, db_index=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()

    # link to related objects
    assessment = models.ForeignKey('logs.Assessment', on_delete=models.CASCADE, null=True, blank=True)
    evaluation = models.ForeignKey('evaluations.Evaluation', on_delete=models.CASCADE, null=True, blank=True)
    weekly_log = models.ForeignKey('logs.WeeklyLog', on_delete=models.CASCADE, null=True, blank=True)

    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        """
        String representation of the notification.

        Returns:
            str: Brief identifying text.
        """
        return f"{self.title or 'Notification'} - {self.recipient or self.user}"

    def mark_as_read(self):
        """
        Mark notification as read and save changes.
        """
        self.is_read = True
        self.save()
