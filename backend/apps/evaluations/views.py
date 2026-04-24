from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Evaluation
from .serializers import EvaluationSerializer
from apps.common.permissions import IsAcademicSupervisor

# Create your views here.
class EvaluationViewSet(viewsets.ModelViewSet):
    """
    Handles evaluation CRUD operations.

    Access Rules:
    - Only academic supervisors can create/update
    - All authenticated users can view (optional: restrict later)
    """

    queryset = Evaluation.objects.select_related(
        'weekly_log',
        'academic_supervisor'
    )

    serializer_class = EvaluationSerializer

    def get_permissions(self):
        """
        Restrict write actions to academic supervisors.
        """

        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAcademicSupervisor()]

        return [IsAuthenticated()]
