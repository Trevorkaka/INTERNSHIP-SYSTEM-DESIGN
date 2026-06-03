from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/refresh/', views.refresh_token, name='refresh'),
]