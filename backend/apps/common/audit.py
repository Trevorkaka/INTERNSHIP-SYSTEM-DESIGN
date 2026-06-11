"""
Audit logger helper functions for the Common application.

Provides system-wide audit trail functionalities to record user actions on objects
and store snapshots of model modifications.
"""

from .models import AuditLog


def log_action(user, action, instance, previous_state=None, new_state=None):
    """
    Generate and persist an AuditLog record to the database.

    Args:
        user (CustomUser): The user performing the action.
        action (str): Description of the action (e.g., 'CREATE', 'UPDATE').
        instance (Model): Affected Django model instance.
        previous_state (dict, optional): Snapshot JSON or dictionary of the model state before change.
        new_state (dict, optional): Snapshot JSON or dictionary of the model state after change.
    """
    AuditLog.objects.create(
        user=user,
        action=action,
        object_type=instance.__class__.__name__,
        object_id=instance.id,
        previous_state=previous_state,
        new_state=new_state
    )
