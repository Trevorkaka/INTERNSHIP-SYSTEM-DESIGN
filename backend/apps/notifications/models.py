from django.db import models
from django.conf import settings


class Notification(models.Model):
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
        return f"{self.title or 'Notification'} - {self.recipient or self.user}"

    def mark_as_read(self):
        self.is_read = True
        self.save()
