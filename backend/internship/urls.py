from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

#def test(request):
    #return HttpResponse("Internship works")

urlpatterns = [
    path('register/', views.register_view, name='register'),#to handle user registration
    path('login/',views.login_view, name='login'), #to handle user login
    path('logout/', views.logout_view, name='logout'), #to handle user logout
]