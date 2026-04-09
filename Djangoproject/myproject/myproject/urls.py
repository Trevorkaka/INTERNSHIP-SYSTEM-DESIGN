"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from core import views
from core.views import home
#from django.http import HttpResponse

#def home(request):
    #return HttpResponse("Welcome to ILES System")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('students/', views.student_list),
    path('add/', views.add_student),
    path('', home ),
    path('', include('internship.urls')),  #this line includes the urls from the internship app, so any url patterns defined in internship/urls.py will be included in the main url configuration

] ***this means /register/ and /login/ work directly instead of /internship/register/ and /internship/login/ because we included the internship urls in the main url configuration***
