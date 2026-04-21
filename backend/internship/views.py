from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from internship.models import (
    User, Student, WorkPlaceSupervisor, AcademicSupervisor,
    WeeklyLog, EvaluationCriteria, Evaluation,
    Assessment, Notification, InternshipPlacement
)
from internship.serializers import (
    UserSerializer, StudentSerializer, WorkPlaceSupervisorSerializer,
    AcademicSupervisorSerializer, WeeklyLogSerializer,
 EvaluationCriteriaSerializer, NotificationSerializer,
    EvaluationSerializer, AssessmentSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]