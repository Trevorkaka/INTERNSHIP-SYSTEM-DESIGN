from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.common.audit import log_action


class WeeklyLogWorkflow:
    """
    Encapsulates all state transitions for WeeklyLog.

    Why separate this?
    - Keeps model clean
    - Centralizes workflow rules
    - Easier to test and maintain
    """

    @staticmethod
    def submit(log, user):
        """
        Transition: DRAFT → SUBMITTED

        Rules:
        - Only student can submit
        - Cannot submit after deadline
        """
        previous = {"status": log.status}

        if log.status != 'DRAFT':
            raise ValidationError("Only draft logs can be submitted.")

        if user != log.placement.student:
            raise ValidationError("Only the assigned student can submit this log.")

        if timezone.now() > log.deadline:
            raise ValidationError("Cannot submit after deadline.")

        log.status = 'SUBMITTED'
        log.submitted_at = timezone.now()
        log.save()

        log_action(
            user=user,
            action="SUBMIT_LOG",
            instance=log,
            previous_state=previous,
            new_state={"status": log.status}
        )

    @staticmethod
    def review(log, user):
        """
        Transition: SUBMITTED → REVIEWED

        Rules:
        - Only assigned workplace supervisor
        """

        if log.status != 'SUBMITTED':
            raise ValidationError("Only submitted logs can be reviewed.")

        if user != log.placement.workplace_supervisor:
            raise ValidationError("Only assigned workplace supervisor can review.")

        log.status = 'REVIEWED'
        log.reviewed_at = timezone.now()
        log.save()

    @staticmethod
    def approve(log, user):
        """
        Transition: REVIEWED → APPROVED
        """

        if log.status != 'REVIEWED':
            raise ValidationError("Log must be reviewed before approval.")

        if user != log.placement.workplace_supervisor:
            raise ValidationError("Only supervisor can approve.")

        log.status = 'APPROVED'
        log.save()

    @staticmethod
    def reject(log, user, comment):
        """
        Transition: REVIEWED → REJECTED

        Requires comment.
        """

        if log.status != 'REVIEWED':
            raise ValidationError("Log must be reviewed before rejection.")

        if user != log.placement.workplace_supervisor:
            raise ValidationError("Only supervisor can reject.")

        if not comment:
            raise ValidationError("Rejection must include a comment.")

        log.status = 'REJECTED'
        log.supervisor_comments = comment
        log.save()

    @staticmethod
    def send_back_to_draft(log, user):
        """
        Transition: REVIEWED → DRAFT
        """

        if log.status != 'REVIEWED':
            raise ValidationError("Only reviewed logs can be sent back.")

        if user != log.placement.workplace_supervisor:
            raise ValidationError("Only supervisor can send back.")

        log.status = 'DRAFT'
        log.save()