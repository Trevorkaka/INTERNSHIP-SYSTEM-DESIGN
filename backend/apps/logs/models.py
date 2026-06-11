"""
Models for the Logs application.

This module defines structures for:
- WeeklyLog: Drafts and submissions by students detailing weekly internship activities.
- Assessment: Evaluations, marks, and feedback provided by academic or workplace supervisors.
"""

from django.db import models
from django.conf import settings


class WeeklyLog(models.Model):
    """
    Weekly log model representing a student's weekly internship report.

    Students write activities, challenges, and proposed solutions for each week of their placement.
    A log begins as a 'draft' and progresses through 'submitted', 'reviewed', and 'approved'.

    Attributes:
        STATUS_CHOICES (tuple of tuple): Possible statuses of the weekly log:
            - 'draft': Editable by student, invisible/unreviewable by supervisors.
            - 'submitted': Completed by student, visible for supervisor review.
            - 'reviewed': Evaluated and marked as reviewed by a supervisor.
            - 'approved': Locked and finalized by an administrator.
        student (ForeignKey): The student profile that authored this log.
        week_number (IntegerField): The chronological internship week (e.g., Week 1, Week 2).
        activities (TextField): Description of tasks performed and lessons learned.
        challenges (TextField): Difficulties or issues encountered during the week.
        solutions (TextField): Actions taken or proposed to resolve the challenges.
        status (CharField): Current approval workflow state.
        submitted_at (DateTimeField): Optional timestamp when the student submitted the log.
    """
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
        """
        Transition status to 'submitted' and persist the log.
        """
        self.status = "submitted"
        self.save()

    def __str__(self):
        """
        String representation of the WeeklyLog.

        Returns:
            str: Chronological week number and status.
        """
        return f"week {self.week_number} - {self.status}"


class Assessment(models.Model):
    """
    Assessment model representing feedback and marks given to a WeeklyLog.

    Supervisors grade a submitted weekly log, recording their marks and feedback.

    Attributes:
        log (ForeignKey): The specific WeeklyLog being assessed.
        assessor (ForeignKey): The supervisor (CustomUser) performing the assessment.
        marks (IntegerField): Numerical grade/score awarded to the log.
        feedback (TextField): Qualitative commentary or guidance for the student.
        assessed_at (DateTimeField): Auto-populated timestamp of creation.
    """
    log = models.ForeignKey(WeeklyLog, on_delete=models.CASCADE)
    assessor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    marks = models.IntegerField()
    feedback = models.TextField()
    assessed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        String representation of the Assessment.

        Returns:
            str: Username of assessor and the assessed week number.
        """
        return f"{self.assessor.username} - week {self.log.week_number}"
