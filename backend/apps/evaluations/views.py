from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsAdminOrReadOnly, IsAdminOrAnySupervisor
from .models import EvaluationCriteria, Evaluation
from .serializers import EvaluationCriteriaSerializer, EvaluationSerializer


class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'max_score']


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related('log', 'criteria', 'evaluator')
    serializer_class = EvaluationSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['criteria', 'log__week_number']
    search_fields = ['feedback']
    ordering_fields = ['score', 'created_at']   

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
        elif getattr(user, "is_academic_supervisor", False) or getattr(user, "is_workplace_supervisor", False):
            return queryset.filter(evaluator=user)
        return queryset
    
    def perform_create(self, serializer):
        # Automatically set the evaluator to the logged-in supervisor
        serializer.save(evaluator=self.request.user)
