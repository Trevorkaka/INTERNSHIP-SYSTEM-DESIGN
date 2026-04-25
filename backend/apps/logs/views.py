from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import WeeklyLog
from .serializers import WeeklyLogSerializer
from .workflow import WeeklyLogWorkflow

from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsRelatedToWeeklyLog

from apps.common.permissions import (
    IsRelatedToWeeklyLog,
    IsAdminUserRole,
    IsAcademicSupervisor
)

# Create your views here.
class WeeklyLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing weekly logs and workflow actions.
    """

    queryset = WeeklyLog.objects.select_related(
        'placement',
        'placement__student',
        'placement__workplace_supervisor'
    )

    serializer_class = WeeklyLogSerializer
    permission_classes = [
        IsAuthenticated,
    IsRelatedToWeeklyLog  # 👈 object-level protection
    ]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)

        if role == 'student':
            return WeeklyLog.objects.filter(placement__student=user)

        if role == 'workplace_supervisor':
            return WeeklyLog.objects.filter(
                placement__workplace_supervisor=user
            )

        if role == 'academic_supervisor':
            return WeeklyLog.objects.filter(
                placement__academic_supervisor=user
            )

        if role == 'admin':
            return WeeklyLog.objects.all()

        return WeeklyLog.objects.none()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        log = self.get_object()
        WeeklyLogWorkflow.submit(log, request.user)
        return Response({"message": "Log submitted successfully"})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        log = self.get_object()
        WeeklyLogWorkflow.review(log, request.user)
        return Response({"message": "Log reviewed"})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        log = self.get_object()
        WeeklyLogWorkflow.approve(log, request.user)
        return Response({"message": "Log approved"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        log = self.get_object()
        comment = request.data.get('comment')
        WeeklyLogWorkflow.reject(log, request.user, comment)
        return Response({"message": "Log rejected"})

    @action(detail=True, methods=['post'])
    def send_back(self, request, pk=None):
        log = self.get_object()
        WeeklyLogWorkflow.send_back_to_draft(log, request.user)
        return Response({"message": "Log sent back to draft"})
