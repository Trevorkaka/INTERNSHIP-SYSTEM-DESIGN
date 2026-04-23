from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, WorkPlaceSupervisorViewSet,
    AcademicSupervisorViewSet, WeeklyLogViewSet, EvaluationCriteriaViewSet,
    EvaluationViewSet, AssessmentViewSet, NotificationViewSet
)