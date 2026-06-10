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
    queryset = WeeklyLog.objects.select_related('student__user')
    serializer_class = WeeklyLogSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'week_number']
    search_fields = ['activities', 'challenges', 'solutions']  
    ordering_fields = ['week_number', 'submitted_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsStudent]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]  

    def get_queryset(self):
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
        # Automatically link the log to the student logged in
        student = self.request.user.student # onetoone reverse relation
        serializer.save(student=student)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent]) 
    def submit(self, request, pk=None):
        """
        POST /api/weekly-logs/{id}/submit/
        changes log status from draft to submitted and records the timestamp.
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
        POST /api/weekly-logs/{id}/review/
        Supervisor marks a submitted log as reviewed.
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
        POST /api/weekly-logs/{id}/approve/
        Admin approves a reviewed log.
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
    queryset = Assessment.objects.select_related('log', 'assessor')
    serializer_class = AssessmentSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['log__week_number']
    search_fields = ['feedback']
    ordering_fields = ['marks', 'assessed_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(log__student__user=user)
        return queryset
    
    def perform_create(self, serializer):
        # Automatically set the assessor to the logged-in supervisor
        serializer.save(assessor=self.request.user)
