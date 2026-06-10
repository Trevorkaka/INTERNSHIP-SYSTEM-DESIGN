from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related('recipient', 'user')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(recipient=user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        POST /api/notifications/{id}/mark-as-read/
        Marks a single notification as read.
        """
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read.'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        POST /api/notifications/mark_all_as_read/
        Marks ALL of the logged-in user's notifications as read at once.
        """  
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
    
        return Response(
            {'message': f'{updated} notification(s) marked as read.'},
            status=status.HTTP_200_OK
        )
