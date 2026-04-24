from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal

from apps import logs

# Create your models here.
User = settings.AUTH_USER_MODEL


class EvaluationCriteria(models.Model):
    """
    Defines evaluation criteria and their weights.

    Example:
    - Technical Skills → 40%
    - Communication → 30%
    - Professionalism → 30%

    This allows flexibility if weights ever change.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the evaluation criteria"
    )

    weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Weight (e.g., 40.00 for 40%)"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Evaluation Criteria"

    def __str__(self):
        return f"{self.name} ({self.weight_percentage}%)"


class Evaluation(models.Model):
    """
    Represents an academic evaluation for a weekly log.

    Responsibilities:
    - Stores scores for each criterion
    - Automatically computes total score
    - Enforces one evaluation per log
    - Restricts evaluation to assigned academic supervisor
    """

    weekly_log = models.OneToOneField(
        'logs.WeeklyLog',
        on_delete=models.CASCADE,
        related_name='evaluation',
        help_text="The weekly log being evaluated"
    )

    academic_supervisor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        help_text="Supervisor performing the evaluation"
    )

    # --- Scores ---
    technical_score = models.DecimalField(max_digits=5, decimal_places=2)
    communication_score = models.DecimalField(max_digits=5, decimal_places=2)
    professionalism_score = models.DecimalField(max_digits=5, decimal_places=2)

    # --- Computed ---
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        editable=False,
        help_text="Auto-calculated total score"
    )

    comments = models.TextField(blank=True)

    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation for {self.weekly_log} → {self.total_score}"

    def clean(self):
        """
        Enforce business rules.
        """

        # --- Ensure correct supervisor ---
        if self.academic_supervisor != self.weekly_log.placement.academic_supervisor:
            raise ValidationError("Only assigned academic supervisor can evaluate.")

        # --- Ensure log is approved ---
        if self.weekly_log.status != 'APPROVED':
            raise ValidationError("Only approved logs can be evaluated.")

        # --- Score validation ---
        for field in ['technical_score', 'communication_score', 'professionalism_score']:
            value = getattr(self, field)
            if not (0 <= value <= 100):
                raise ValidationError(f"{field} must be between 0 and 100.")

    def calculate_total_score(self):
        """
        Compute weighted score.

        Uses fixed weights:
        - Technical: 40%
        - Communication: 30%
        - Professionalism: 30%
        """

        return (
            (self.technical_score * Decimal('0.4')) +
            (self.communication_score * Decimal('0.3')) +
            (self.professionalism_score * Decimal('0.3'))
        )

    def save(self, *args, **kwargs):
        """
        Override save to:
        - Validate data
        - Auto-compute total score
        """

        self.full_clean()  # Run validations

        # Compute score
        self.total_score = self.calculate_total_score()

        super().save(*args, **kwargs)
