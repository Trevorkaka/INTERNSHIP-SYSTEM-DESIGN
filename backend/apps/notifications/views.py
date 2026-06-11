"""
Views and API ViewSets for the Notifications application.

Provides endpoints to list notifications, filter them by type or read-status,
and perform action endpoints to mark specific notifications or all notifications
as read.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing in-app notifications.

    Allows authenticated users to retrieve their personalized notifications,
    mark individual ones as read, or bulk mark all as read.
    """
    queryset = Notification.objects.select_related('recipient', 'user')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']

    def get_queryset(self):
        """
        Filter the query set to only return notifications belonging to the logged-in user.

        Returns:
            QuerySet: Filtered notification records.
        """
        user = self.request.user
        return self.queryset.filter(recipient=user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a single notification as read.

        Args:
            request (Request): REST framework Request object.
            pk (str): Primary key of the notification to update.

        Returns:
            Response: Success confirmation message (200 OK).
        """
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read.'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all of the logged-in user's notifications as read in bulk.

        Args:
            request (Request): REST framework Request object.

        Returns:
            Response: Success response stating the count of updated notifications (200 OK).
        """  
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
    
        return Response(
            {'message': f'{updated} notification(s) marked as read.'},
            status=status.HTTP_200_OK
        )
