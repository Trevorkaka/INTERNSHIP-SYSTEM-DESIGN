from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

#-- DRF Router ----------------------------------------------------------------------
# The router auto-generates all standard CRUD endpoints for each ViewSet:
#   GET    /api/students/          → list
#   POST   /api/students/          → create
#   GET    /api/students/{id}/     → retrieve
#   PUT    /api/students/{id}/     → update
#   PATCH  /api/students/{id}/     → partial_update
#   DELETE /api/students/{id}/     → destroy


urlpatterns = [
    path('register/', views.register_view, name='register'),#to handle user registration
    path('login/',views.login_view, name='login'), #to handle user login
    path('logout/', views.logout_view, name='logout'), #to handle user logout
]