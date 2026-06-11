from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.logs.models import WeeklyLog, Assessment
from apps.evaluations.models import Evaluation
from .models import Notification


@receiver(post_save, sender=Assessment)
def create_assessment_notification(sender, instance, created, **kwargs):
    if created:
        student_user = instance.log.student.user
        Notification.objects.create(
            recipient=student_user,
            user=student_user,
            notification_type='assessment',
            title='Assessment Feedback Received',
            message=f"You received feedback on week {instance.log.week_number}: {instance.marks} marks",
            assessment=instance,
            weekly_log=instance.log
        )


@receiver(post_save, sender=Evaluation)
def create_evaluation_notification(sender, instance, created, **kwargs):
    if created:
        log_obj = instance.weekly_log or instance.log
        if log_obj:
            student_user = log_obj.student.user
            Notification.objects.create(
                recipient=student_user,
                user=student_user,
                notification_type='evaluation',
                title='Evaluation Feedback Received',
                message=f'Your Week {log_obj.week_number} work was evaluated on {instance.criteria.name if instance.criteria else "Evaluation"}',
                evaluation=instance,
                weekly_log=log_obj
            )


@receiver(post_save, sender=WeeklyLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    if not created:
        student_user = instance.student.user
        if instance.status == 'reviewed':
            Notification.objects.create(
                recipient=student_user,
                user=student_user,
                notification_type='log_reviewed',
                title='Weekly Log Reviewed',
                message=f'Your Week {instance.week_number} log has been reviewed',
                weekly_log=instance
            )
        elif instance.status == 'approved':
            Notification.objects.create(
                recipient=student_user,
                user=student_user,
                notification_type='log_approved',
                title='Weekly Log Approved',
                message=f'Your Week {instance.week_number} log has been approved',
                weekly_log=instance
            )
