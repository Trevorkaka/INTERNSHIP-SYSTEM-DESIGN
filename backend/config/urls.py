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



urlpatterns =[
    path('admin/', admin.site.urls),

    #internship app handles /register/, /login/, /logout/
    path('', include('internship.urls')), #include the urls from the internship app, this means any url that starts with / will be handled by the internship app
<<<<<<< HEAD
    path('students/', views.student_list),
    path('add/', views.add_student),
    path('', home ),

     g
    path('', include('core.urls')), 

    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/placements/', include('apps.placements.urls')),
    path('api/evaluations/', include('apps.evaluations.urls')),


=======
   
     # core app handles /students/, /add/, and the home page
    path('', include('core.urls')), #core/urls.py already defines path('', views.home, name='home'), so we can just include it here without defining a separate path for the home page
>>>>>>> 54335b042da3ff237d1bffd5900ff6bb8a7ee387
] 
