from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import the ViewSets from all modular apps
from apps.accounts import views as accounts_views
from apps.logs import views as logs_views
from apps.evaluations import views as evaluations_views
from apps.notifications import views as notifications_views
from apps.placements import views as placements_views

router = DefaultRouter()

# Register ViewSets with matching basenames and url patterns as requested by the frontend
router.register(r'users',                 accounts_views.UserViewSet,                basename='user')
router.register(r'students',              accounts_views.StudentViewSet,             basename='student')
router.register(r'workplace-supervisors', accounts_views.WorkPlaceSupervisorViewSet, basename='workplace-supervisor')
router.register(r'academic-supervisors',  accounts_views.AcademicSupervisorViewSet,  basename='academic-supervisor')

router.register(r'weekly-logs',           logs_views.WeeklyLogViewSet,               basename='weekly-log')
router.register(r'assessments',           logs_views.AssessmentViewSet,              basename='assessment')

router.register(r'evaluations',           evaluations_views.EvaluationViewSet,          basename='evaluation')
router.register(r'evaluation-criteria',    evaluations_views.EvaluationCriteriaViewSet,  basename='evaluation-criteria')
router.register(r'evaluaton-criteria',    evaluations_views.EvaluationCriteriaViewSet,  basename='evaluation-criteria-typo') # Support typo path

router.register(r'notifications',         notifications_views.NotificationViewSet,        basename='notification')
router.register(r'placements',            placements_views.InternshipPlacementViewSet,   basename='placement')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls')),          # home page

    # Auth views (rendered HTML pages for accounts / login)
    path('register/', accounts_views.register_view, name='register'),
    path('login/',    accounts_views.login_view,    name='login'),
    path('logout/',   accounts_views.logout_view,   name='logout'),

    # -- JWT API Auth (for React frontend)
    path('api/auth/login/', accounts_views.login,  name='jwt-login'),
    path('api/auth/signup/', accounts_views.signup, name='jwt-signup'),
    path('api/auth/register/', accounts_views.signup, name='jwt-register'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='jwt-refresh'),
    path('api/auth/logout/',  accounts_views.logout,   name='jwt-logout'),

    # All REST API endpoints live under /api/
    path('api/', include(router.urls)),

    # DRF browsable API login (useful during development)
    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),

    path('auth/verify-email/<uidb64>/<token>/', accounts_views.verify_email, name='verify_email'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
