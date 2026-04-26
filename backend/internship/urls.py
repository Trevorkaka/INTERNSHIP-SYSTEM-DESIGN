from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshview  

from . import views

#-- DRF Router ----------------------------------------------------------------------
# The router auto-generates all standard CRUD endpoints for each ViewSet:
#   GET    /api/students/          → list
#   POST   /api/students/          → create
#   GET    /api/students/{id}/     → retrieve
#   PUT    /api/students/{id}/     → update
#   PATCH  /api/students/{id}/     → partial_update
#   DELETE /api/students/{id}/     → destroy

router = DefaultRouter()
router.register(r'users',                 views.UserViewSet,                basename='user')
router.register(r'students',              views.StudentViewSet,             basename='student')
router.register(r'workplace-supervisors', views.WorkPlaceSupervisorViewSet, basename='workplace-supervisor')
router.register(r'academic-supervisors',  views.AcademicSupervisorViewSet,  basename='academic-supervisor')
router.register(r'weekly-logs',           views.WeeklyLogViewSet,           basename='weekly-log')
router.register(r'evaluations',           views.EvaluationViewSet,          basename='evaluation')
router.register(r'evaluaton-criteria',    views.EvaluationCriteriaViewSet,  basename='evaluation-criteria')
router.register(r'assessments',           views.AssessmentViewSet,          basename='assessment')
router.register(r'notifications',         views.NotificationViewSet,        basename='notification')


urlpatterns = [
    #Auth views (rendered HTML pages)
    path('register/', views.register_view, name='register'),#to handle user registration
    path('login/',    views.login_view,    name='login'), #to handle user login
    path('logout/',   views.logout_view,   name='logout'), #to handle user logout

    #All REST API endpoints live under /api/
    path('api/', include(router.urls)),

    #DRF browsable API login (useful during development)
    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),

]

