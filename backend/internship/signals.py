from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Assessment, Evaluation, WeeklyLog, Notification

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
 