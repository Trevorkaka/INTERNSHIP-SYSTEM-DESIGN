from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.logs.models import WeeklyLog
from .models import Notification


@receiver(post_save, sender=WeeklyLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    """
    Trigger notifications when log status changes.
    """

    if created:
        return  # ignore creation

    student = instance.placement.student
    supervisor = instance.placement.workplace_supervisor

    # --- Status-based notifications ---
    if instance.status == 'SUBMITTED':
        Notification.objects.create(
            user=supervisor,
            message=f"New log submitted by {student}"
        )

    elif instance.status == 'APPROVED':
        Notification.objects.create(
            user=student,
            message=f"Your log for week {instance.week_number} was approved"
        )

    elif instance.status == 'REJECTED':
        Notification.objects.create(
            user=student,
            message=f"Your log was rejected: {instance.supervisor_comments}"
        )