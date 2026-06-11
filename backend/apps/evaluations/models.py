"""
Models for the Evaluations application.

This module provides definitions for:
- EvaluationCriteria: Custom performance metrics used to grade weekly logs and internships.
- Evaluation: The completed assessment sheet for a weekly log, including scores,
  weighted calculations, and qualitative supervisor commentary.
"""

from django.db import models
from django.conf import settings


class EvaluationCriteria(models.Model):
    """
    Model representing evaluation categories/criteria.

    Enables dynamic definition of metrics, their max scores, and relative weights.

    Attributes:
        name (CharField): The category name of the criterion (e.g., Technical Skills).
        max_score (IntegerField): Maximum grade allowed for this criterion.
        weight_percentage (DecimalField): Relative importance of this criterion towards the aggregate.
        is_active (BooleanField): Indicator of whether the criterion is currently active.
    """
    name = models.CharField(max_length=100)
    max_score = models.IntegerField(default=10)
    weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weight (e.g., 40.00 for 40%)"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        """
        String representation of the criterion.

        Returns:
            str: Name of the criteria.
        """
        return self.name


class Evaluation(models.Model):
    """
    Model representing a student's performance evaluation.

    Links a WeeklyLog to scores for technical expertise, communication, and professionalism,
    and automatically calculates a weighted total score.

    Attributes:
        log (ForeignKey): Associated WeeklyLog (legacy field).
        evaluator (ForeignKey): The CustomUser acting as the evaluator.
        criteria (ForeignKey): Associated EvaluationCriteria (legacy field).
        score (IntegerField): Single legacy score field.
        feedback (TextField): Qualitative legacy feedback.
        created_at (DateTimeField): Creation timestamp.
        weekly_log (OneToOneField): One-to-one link to the evaluated WeeklyLog.
        academic_supervisor (ForeignKey): Reference to the academic supervisor.
        technical_score (DecimalField): Score for technical performance (weighted 40%).
        communication_score (DecimalField): Score for communication (weighted 30%).
        professionalism_score (DecimalField): Score for professionalism (weighted 30%).
        total_score (DecimalField): Weighted final grade, auto-calculated on save.
        comments (TextField): Comments/suggestions for the student's development.
    """
    log = models.ForeignKey('logs.WeeklyLog', on_delete=models.CASCADE, related_name='evaluations', null=True, blank=True)
    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='internship_evaluations',
        null=True, blank=True
    )
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE, null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Newer fields for compatibility:
    weekly_log = models.OneToOneField(
        'logs.WeeklyLog',
        on_delete=models.CASCADE,
        related_name='evaluation',
        null=True,
        blank=True,
        help_text="The weekly log being evaluated"
    )
    academic_supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_as_supervisor',
        null=True, blank=True
    )
    technical_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    communication_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    professionalism_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        editable=False,
        null=True,
        blank=True,
        help_text="Auto-calculated total score"
    )
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        """
        String representation of the evaluation.

        Returns:
            str: Evaluator and criteria/log details.
        """
        if self.criteria:
            return f"{self.evaluator.username if self.evaluator else 'Evaluator'} - {self.criteria.name}"
        return f"Evaluation for {self.weekly_log or self.log}"

    def calculate_total_score(self):
        """
        Perform a weighted total score calculation.

        Formulas:
            Total = (Technical * 40%) + (Communication * 30%) + (Professionalism * 30%)

        Returns:
            Decimal: Computed total score.
        """
        from decimal import Decimal
        tech = self.technical_score or Decimal('0')
        comm = self.communication_score or Decimal('0')
        prof = self.professionalism_score or Decimal('0')
        return (tech * Decimal('0.4')) + (comm * Decimal('0.3')) + (prof * Decimal('0.3'))

    def save(self, *args, **kwargs):
        """
        Override save to automatically calculate the total score before saving to database.
        """
        if self.technical_score is not None and self.communication_score is not None and self.professionalism_score is not None:
            self.total_score = self.calculate_total_score()
        super().save(*args, **kwargs)
