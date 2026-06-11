from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class InternshipPlacement(models.Model):
    """
    Represents a student's internship placement.
    """
    student = models.OneToOneField(
        'accounts.Student',
        on_delete=models.CASCADE,
        related_name='placement',
        help_text="The student assigned to this placement"
    )

    workplace_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workplace_placements',
        help_text="Supervisor at the workplace"
    )

    academic_supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_placements',
        help_text="Supervisor from the academic institution"
    )

    company_name = models.CharField(
        max_length=100,
        help_text="Name of the company where internship takes place"
    )

    position = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Role or position during internship"
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
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.student} - {self.company_name} ({self.start_date} to {self.end_date})"

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
