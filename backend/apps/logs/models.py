from django.db import models
from django.conf import settings


class WeeklyLog(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved')
    )
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE)
    week_number = models.IntegerField(db_index=True)
    activities = models.TextField()
    challenges = models.TextField()
    solutions = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def submit(self):
        self.status = "submitted"
        self.save()

    def __str__(self):
        return f"week {self.week_number} - {self.status}"


class Assessment(models.Model):
    log = models.ForeignKey(WeeklyLog, on_delete=models.CASCADE)
    assessor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    marks = models.IntegerField()
    feedback = models.TextField()
    assessed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.assessor.username} - week {self.log.week_number}"
