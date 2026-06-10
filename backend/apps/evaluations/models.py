from django.db import models
from django.conf import settings


class EvaluationCriteria(models.Model):
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
        return self.name


class Evaluation(models.Model):
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
        if self.criteria:
            return f"{self.evaluator.username if self.evaluator else 'Evaluator'} - {self.criteria.name}"
        return f"Evaluation for {self.weekly_log or self.log}"

    def calculate_total_score(self):
        from decimal import Decimal
        tech = self.technical_score or Decimal('0')
        comm = self.communication_score or Decimal('0')
        prof = self.professionalism_score or Decimal('0')
        return (tech * Decimal('0.4')) + (comm * Decimal('0.3')) + (prof * Decimal('0.3'))

    def save(self, *args, **kwargs):
        if self.technical_score is not None and self.communication_score is not None and self.professionalism_score is not None:
            self.total_score = self.calculate_total_score()
        super().save(*args, **kwargs)
