"""
Views and API ViewSets for the Evaluations application.

This module provides the REST API endpoints to manage evaluation metrics
and complete performance evaluations of students' weekly internship reports.
"""

from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsAdminOrReadOnly, IsAdminOrAnySupervisor
from .models import EvaluationCriteria, Evaluation
from .serializers import EvaluationCriteriaSerializer, EvaluationSerializer


class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for EvaluationCriteria.

    Enables administrators to create and manage evaluation metrics and thresholds.
    Read-only for authenticated non-admin users.
    """
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'max_score']


class EvaluationViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for Evaluation records.

    Allows supervisors and administrators to manage detailed student evaluations
    linked to weekly reports. Ensures data visibility boundaries are respected.
    """
    queryset = Evaluation.objects.select_related('log', 'criteria', 'evaluator')
    serializer_class = EvaluationSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['criteria', 'log__week_number']
    search_fields = ['feedback']
    ordering_fields = ['score', 'created_at']   

    def get_permissions(self):
        """
        Dynamically determine permission classes based on view action.

        - 'create', 'update', 'partial_update', 'destroy': restricted to supervisors/admins.
        - Other: authenticated.

        Returns:
            list: Instantiated permission criteria.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter the query set according to user role to secure evaluations data.

        - Students only access assessments associated with their logs.
        - Supervisors only access the evaluations they individually compiled.
        - Admins access all evaluations.

        Returns:
            QuerySet: Filtered evaluation query set.
        """
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(log__student__user=user)
        elif getattr(user, "is_academic_supervisor", False) or getattr(user, "is_workplace_supervisor", False):
            return queryset.filter(evaluator=user)
        return queryset
    
    def perform_create(self, serializer):
        """
        Override standard creation to set active evaluator as the logged-in supervisor user.

        Args:
            serializer (EvaluationSerializer): Validated evaluation data serializer.
        """
        serializer.save(evaluator=self.request.user)
