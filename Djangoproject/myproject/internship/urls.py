#from django.urls import path #import views from the current directory
#from .views import students # import the students view from the views.py file in the current directory

#urlpatterns = [
    #path('students/', students),

#]

from django.urls import path
from django.http import HttpResponse

def test(request):
    return HttpResponse("Internship works")

urlpatterns = [
    path('', test),
]