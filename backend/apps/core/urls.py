from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('students/', views.student_list, name='students'),
    path('add/', views.add_student, name='add_student'),
]


