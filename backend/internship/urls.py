#from django.urls import path #import views from the current directory
#from .views import students # import the students view from the views.py file in the current directory

#urlpatterns = [
    #path('students/', students),

#]

from django.urls import path
#from django.http import HttpResponse
from . import views

#def test(request):
    #return HttpResponse("Internship works")

urlpatterns = [
    path('register/', views.register_view, name='register'),#to handle user registration
    path('login/',views.login_view, name='login'), #to handle user login
    path('logout/', views.logout_view, name='logout'), #to handle user logout
]