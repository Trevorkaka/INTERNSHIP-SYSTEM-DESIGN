from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Assessment, Evaluation, WeeklyLog, Notification

@receiver(post_save, sender=Assessment)
def create_assessment_notification(sender, instance, created, **kwargs):
# create notification when assessment is created
    if created:
        student_user = instance.log.student.user
        Notification.objects.create(
            recipient=student_user,
            notification_type='assessment',
            title='Assessment Feedback Received',
            message=f"You received feedback on week {instance.log.week_number}: {instance.marks} marks",
            assessment=instance,
            WeeklyLog=instance.log
        )

@receiver(post_save, sender=Evaluation)
def create_evaluation_notification(sender, instance, created, **kwargs):
    """Create notification when evaluation is created"""
    if created:
        student_user = instance.log.student.user
        Notification.objects.create(
            recipient=student_user,
            notification_type='evaluation',
            title='Evaluation Feedback Received',
            message=f'Your Week {instance.log.week_number} work was evaluated on {instance.criteria.name}',
            evaluation=instance,
            weekly_log=instance.log
        )
 

@receiver(post_save, sender=WeeklyLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    """Notify when log status changes to reviewed or approved"""
    if not created:
        # Check if status just changed (you might want to track old status)
        if instance.status == 'reviewed':
            Notification.objects.create(
                recipient=instance.student.user,
                notification_type='log_reviewed',
                title='Weekly Log Reviewed',
                message=f'Your Week {instance.week_number} log has been reviewed',
                weekly_log=instance
            )
        elif instance.status == 'approved':
            Notification.objects.create(
                recipient=instance.student.user,
                notification_type='log_approved',
                title='Weekly Log Approved',
                message=f'Your Week {instance.week_number} log has been approved',
                weekly_log=instance
            )
 