"""
Views and API ViewSets for the Logs application.

This module provides custom ViewSets for:
- WeeklyLog management (creation, update, submission, review, and approval).
- Assessment of WeeklyLogs by supervisors (marks, feedback).
"""

from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.common.permissions import (
    IsStudent, IsAdminOrAnySupervisor, IsAdmin, IsRelatedToWeeklyLog
)
from .models import WeeklyLog, Assessment
from .serializers import WeeklyLogSerializer, AssessmentSerializer


class WeeklyLogViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing WeeklyLog records.

    Allows students to create and maintain their own weekly logs as drafts,
    submit them, and enables supervisors and administrators to review and approve them.

    Attributes:
        queryset (QuerySet): Selected weekly logs with nested student user profile.
        serializer_class (WeeklyLogSerializer): Serializer class for WeeklyLog operations.
    """
    queryset = WeeklyLog.objects.select_related('student__user')
    serializer_class = WeeklyLogSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'week_number']
    search_fields = ['activities', 'challenges', 'solutions']  
    ordering_fields = ['week_number', 'submitted_at']

    def get_permissions(self):
        """
        Determine permissions based on the active ViewSet action.

        - 'create', 'update', 'partial_update' actions are limited to students.
        - Other actions fall back to default ModelViewSet permissions.

        Returns:
            list: Instantiated permission objects.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return [IsStudent()]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filter the logs depending on the authenticated user's role.

        - Students retrieve only their own weekly logs.
        - Academic supervisors retrieve logs for their assigned students.
        - Workplace supervisors retrieve logs for their assigned students.
        - Admins retrieve all weekly logs.

        Returns:
            QuerySet: Filtered query set of WeeklyLog records.
        """
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(student__user=user)
        elif getattr(user, "is_academic_supervisor", False):
            return queryset.filter(student__academic_supervisor=user)
        elif getattr(user, "is_workplace_supervisor", False):
            return queryset.filter(student__work_place_supervisor=user)
        return queryset
    
    def perform_create(self, serializer):
        """
        Override default behavior to automatically link the log to the logged-in student.

        Args:
            serializer (WeeklyLogSerializer): The validated serializer instance.
        """
        student = self.request.user.student  # One-to-one reverse relation
        serializer.save(student=student)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent]) 
    def submit(self, request, pk=None):
        """
        Submit a draft weekly log.

        Transitions the status of the weekly log from 'draft' to 'submitted'
        and records the exact submission timestamp.

        Args:
            request (Request): REST framework Request object.
            pk (str): Primary key of the weekly log to submit.

        Returns:
            Response: Message detailing successful submission (200 OK) or error message
            if user does not own the log or log is not in draft status (400/403).
        """
        log = self.get_object()

        if log.student.user != request.user:
            return Response(
                {'error': 'You can only submit your own logs.'},
                status=status.HTTP_403_FORBIDDEN
            )   

        if log.status != 'draft':
            return Response(
                {'error': f'Log is already {log.status}. Only draft logs can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        log.status = 'submitted'
        log.submitted_at = timezone.now()
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log submitted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrAnySupervisor])
    def review(self, request, pk=None):
        """
        Review a submitted weekly log.

        Transitions log status from 'submitted' to 'reviewed' by a supervisor or admin.

        Args:
            request (Request): REST framework Request object.
            pk (str): Primary key of the weekly log to review.

        Returns:
            Response: Success response (200 OK) or error response if the log is not
            in 'submitted' status (400 Bad Request).
        """
        log = self.get_object()

        if log.status != 'submitted':
            return Response(
                {'error': f'Log must be submitted before it can be reviewed. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST    
            )
        
        log.status = 'reviewed'
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log marked as reviewed.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """
        Approve a reviewed weekly log.

        Allows administrator users to transition the status from 'reviewed' to 'approved'.

        Args:
            request (Request): REST framework Request object.
            pk (str): Primary key of the weekly log to approve.

        Returns:
            Response: Success message (200 OK) or error response if log has not
            yet been reviewed (400 Bad Request).
        """
        log = self.get_object()

        if log.status != 'reviewed':
            return Response(
                {'error': f'Log must be reviewed before it can be approved. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST    
            )
        log.status = 'approved'
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log approved.'},
            status=status.HTTP_200_OK
        )


class AssessmentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing log assessments.

    Enables academic/workplace supervisors to grade and supply detailed feedback
    on submitted weekly logs.
    """
    queryset = Assessment.objects.select_related('log', 'assessor')
    serializer_class = AssessmentSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['log__week_number']
    search_fields = ['feedback']
    ordering_fields = ['marks', 'assessed_at']

    def get_permissions(self):
        """
        Determine permissions dynamically depending on the active action.

        - 'create', 'update', 'partial_update', 'destroy': Restricted to supervisors/admins.
        - Other actions: Allowed for any authenticated users.

        Returns:
            list: List of active permission instances.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter Assessments depending on the requesting user.

        Students only retrieve assessments associated with their own logs,
        while supervisors and administrators can retrieve all assessments.

        Returns:
            QuerySet: Filtered Assessment query set.
        """
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(log__student__user=user)
        return queryset
    
    def perform_create(self, serializer):
        """
        Override creator lookup to set the assessor as the currently logged-in supervisor.

        Args:
            serializer (AssessmentSerializer): Serializer holding the validated post data.
        """
        serializer.save(assessor=self.request.user)
