from django.db import models
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

# Create your models here.

User = settings.AUTH_USER_MODEL

class InternshipPlacement(models.Model):
    """
    Represents a student's internship placement.

    Core Responsibilities:
    - Links a student to a company and supervisors
    - Ensures no overlapping placements for the same student
    - Enforces correct role assignments

    Business Rules Enforced:
    - A student cannot have overlapping placements
    - Only users with correct roles can be assigned
    - End date must be after start date
    """

    # --- Relationships ---
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='placements',
        help_text="The student assigned to this placement"
    )

    workplace_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_supervised',
        help_text="Supervisor at the workplace"
    )

    academic_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_supervised',
        help_text="Supervisor from the academic institution"
    )

    # --- Core Fields ---
    company_name = models.CharField(
        max_length=255,
        help_text="Name of the company where internship takes place"
    )

    start_date = models.DateField(
        help_text="Start date of the internship"
    )

    end_date = models.DateField(
        help_text="End date of the internship"
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Indicates if the placement is currently active"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the placement was created"
    )

    class Meta:
        """
        Meta configuration for performance and ordering.
        """
        indexes = [
            # Speeds up overlap checks and filtering by student/date
            models.Index(fields=['student', 'start_date', 'end_date']),
        ]
        ordering = ['-start_date']

    def __str__(self):
        """
        Human-readable representation of the placement.
        """
        return f"{self.student} - {self.company_name} ({self.start_date} to {self.end_date})"

    def clean(self):
        """
        Custom validation logic for enforcing business rules.

        This method is called automatically via `full_clean()` in save().
        """

        # --- Role Validation ---
        # Ensure assigned users have correct roles

        if self.student.role != 'student':
            raise ValidationError("Assigned user must have role 'student'.")

        if self.workplace_supervisor and self.workplace_supervisor.role != 'workplace_supervisor':
            raise ValidationError("Workplace supervisor must have role 'workplace_supervisor'.")

        if self.academic_supervisor and self.academic_supervisor.role != 'academic_supervisor':
            raise ValidationError("Academic supervisor must have role 'academic_supervisor'.")

        # --- Date Validation ---
        # Ensure logical date ordering

        if self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date.")

        # --- Overlapping Placement Validation ---
        # Check if the same student already has a placement
        # that overlaps with this one

        overlapping = InternshipPlacement.objects.filter(
            student=self.student,
            start_date__lt=self.end_date,
            end_date__gt=self.start_date
        ).exclude(id=self.id)

        if overlapping.exists():
            raise ValidationError(
                "This student already has an overlapping placement."
            )

    def save(self, *args, **kwargs):
        """
        Override save to enforce validation before writing to DB.

        Why this matters:
        - Prevents invalid data even if bypassing forms/serializers
        """
        self.full_clean()  # Runs `clean()` and field validation
        super().save(*args, **kwargs)