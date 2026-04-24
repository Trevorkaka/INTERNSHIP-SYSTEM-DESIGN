from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps import placements

# Create your models here.

User = settings.AUTH_USER_MODEL


class WeeklyLog(models.Model):
    """
    Represents a weekly internship log submitted by a student.

    Responsibilities:
    - Stores weekly internship activities
    - Tracks workflow state (DRAFT → SUBMITTED → REVIEWED → APPROVED/REJECTED)
    - Enforces business rules like deadlines and edit restrictions
    """

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    placement = models.ForeignKey(
        'placements.InternshipPlacement',
        on_delete=models.CASCADE,
        related_name='weekly_logs',
        help_text="Placement this log belongs to"
    )

    week_number = models.PositiveIntegerField(
        help_text="Week number (1–16)"
    )

    activities_done = models.TextField()
    challenges_faced = models.TextField()
    plans_for_next_week = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )

    deadline = models.DateTimeField(
        help_text="Submission deadline for this log"
    )

    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    supervisor_comments = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """
        Ensures one log per week per placement.
        """
        unique_together = ('placement', 'week_number')
        ordering = ['week_number']

    def __str__(self):
        return f"{self.placement} - Week {self.week_number} ({self.status})"

    def clean(self):
        """
        Core validation rules.
        """

        # --- Week range validation ---
        if not (1 <= self.week_number <= 16):
            raise ValidationError("Week number must be between 1 and 16.")

        # --- Editing restrictions ---
        if self.pk:
            old = WeeklyLog.objects.get(pk=self.pk)

            if old.status == 'APPROVED':
                raise ValidationError("Approved logs cannot be edited.")

            if old.status == 'REJECTED':
                raise ValidationError("Rejected logs cannot be edited. Create a new log.")

    def save(self, *args, **kwargs):
        """
        Enforce validation before saving.
        """
        self.full_clean()
        super().save(*args, **kwargs)
