from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users',                  views.UserViewSet,                basename='user')
router.register(r'students',               views.StudentViewSet,             basename='student')
router.register(r'workplace-supervisors',  views.WorkPlaceSupervisorViewSet, basename='workplace-supervisor')
router.register(r'academic-supervisors',   views.AcademicSupervisorViewSet,  basename='academic-supervisor')
router.register(r'weekly-logs',            views.WeeklyLogViewSet,           basename='weekly-log')
router.register(r'evaluations',            views.EvaluationViewSet,          basename='evaluation')
router.register(r'evaluation-criteria',    views.EvaluationCriteriaViewSet,  basename='evaluation-criteria')  # ✅ Fixed typo: evaluaton→evaluation
router.register(r'assessments',            views.AssessmentViewSet,          basename='assessment')
router.register(r'notifications',          views.NotificationViewSet,        basename='notification')
router.register(r'placements',             views.InternshipPlacementViewSet, basename='placement')

urlpatterns = [
    # HTML auth pages
    path('register/', views.register_view, name='register'),
    path('login/',    views.login_view,    name='login'),
    path('logout/',   views.logout_view,   name='logout'),

    # JWT API auth
    path('api/auth/login/',   views.jwt_login,              name='jwt-login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(),   name='jwt-refresh'),
    path('api/auth/logout/',  views.jwt_logout,             name='jwt-logout'),

    # All REST endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
]