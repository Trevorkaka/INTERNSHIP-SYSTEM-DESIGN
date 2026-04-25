from .models import AuditLog


def log_action(user, action, instance, previous_state=None, new_state=None):
    """
    Utility function to create audit logs.

    Args:
        user: User performing the action
        action: String describing action
        instance: Model instance affected
        previous_state: dict snapshot before change
        new_state: dict snapshot after change
    """

    AuditLog.objects.create(
        user=user,
        action=action,
        object_type=instance.__class__.__name__,
        object_id=instance.id,
        previous_state=previous_state,
        new_state=new_state
    )