from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, WorkPlaceSupervisorViewSet,
    AcademicSupervisorViewSet, WeeklyLogViewSet, EvaluationCriteriaViewSet,
    EvaluationViewSet, AssessmentViewSet, NotificationViewSet
)

# Initialize the DRF router
router = DefaultRouter()

router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'workplace-supervisors', WorkPlaceSupervisorViewSet, basename='workplace-supervisor')
router.register(r'academic-supervisors', AcademicSupervisorViewSet, basename='academic-supervisor')
router.register(r'weekly-logs', WeeklyLogViewSet, basename='weekly-log')
router.register(r'evaluation-criteria', EvaluationCriteriaViewSet, basename='evaluation-criteria')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Wire up our API using automatic URL routing.
urlpatterns = [
    # All the registered routes will be accessible under the 'api/' prefix
    path('api/', include(router.urls)),
]