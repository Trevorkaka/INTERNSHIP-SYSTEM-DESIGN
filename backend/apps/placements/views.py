from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsAdminUserRole
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer


class InternshipPlacementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing internship placements.
    """
    queryset = InternshipPlacement.objects.select_related(
        'student',
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
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUserRole()]
        return [IsAuthenticated()]
