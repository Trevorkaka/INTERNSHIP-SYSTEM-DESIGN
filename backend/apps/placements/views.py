"""
Views and API ViewSets for the Placements application.

Enables administrators to set up and manage student internship placements, while
allowing students and supervisors to view placement records.
"""

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsAdminUserRole
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer


class InternshipPlacementViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing InternshipPlacements.

    - Creating, modifying, or deleting placements requires admin role authentication.
    - All authenticated users can read details of placements.
    """
    queryset = InternshipPlacement.objects.select_related(
        'student__user',
        'workplace_supervisor',
        'academic_supervisor'
    )
    serializer_class = InternshipPlacementSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'is_active']
    search_fields = ['company_name']
    ordering_fields = ['start_date', 'end_date']
    ordering = ['-start_date']

    def get_permissions(self):
        """
        Dynamically determine permission classes based on view action.

        - 'create', 'update', 'partial_update', 'destroy' actions require Admin role.
        - Other actions are accessible to any authenticated user.

        Returns:
            list: Active permission instances.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUserRole()]
        return [IsAuthenticated()]
