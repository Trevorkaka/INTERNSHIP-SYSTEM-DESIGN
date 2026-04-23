from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, WorkPlaceSupervisorViewSet,
    AcademicSupervisorViewSet, WeeklyLogViewSet, EvaluationCriteriaViewSet,
    EvaluationViewSet, AssessmentViewSet, NotificationViewSet
)

# Initialize the DRF router
router = DefaultRouter()

# Register all your viewsets with the router
# The first argument is the URL prefix, the second is the ViewSet class
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'workplace-supervisors', WorkPlaceSupervisorViewSet, basename='workplace-supervisor')
router.register(r'academic-supervisors', AcademicSupervisorViewSet, basename='academic-supervisor')
router.register(r'weekly-logs', WeeklyLogViewSet, basename='weekly-log')
router.register(r'evaluation-criteria', EvaluationCriteriaViewSet, basename='evaluation-criteria')