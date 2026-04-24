from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer
from apps.common.permissions import IsAdminUserRole

from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.
class InternshipPlacementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing internship placements.

    Access Rules:
    - Any authenticated user can VIEW placements
    - Only admins can CREATE, UPDATE, DELETE

    Optimization:
    - Uses select_related to reduce DB queries
    """

    queryset = InternshipPlacement.objects.select_related(
        'student',
        'workplace_supervisor',
        'academic_supervisor'
    )

    serializer_class = InternshipPlacementSerializer

    # --- Filtering ---
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ['student', 'is_active']
    search_fields = ['company_name']
    ordering_fields = ['start_date', 'end_date']
    ordering = ['-start_date']


    def get_permissions(self):
        """
        Dynamically assign permissions based on action.
        """

        # Only admins can modify data
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUserRole()]

        # All authenticated users can read
        return [IsAuthenticated()]
