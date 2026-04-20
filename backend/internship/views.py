# from asyncio import run
from rest_framework.authtoken.views import ObtainAuthToken
from django.shortcuts import render, redirect #to render the html templates and redirect to other pages
from django.contrib.auth import authenticate, login, logout #to handle user authentication
from django.contrib import messages #to display messages to the user
from .forms import RegistrationForm, LoginForm #importing the forms we created in forms.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
#from django.http import HttpResponse 

# Create your views here.

#def students(request):
    #return HttpResponse("Welcome to the students page!")
# def register_view(request): #to handle user registration
    if request.method == 'POST':
        form = RegistrationForm(request.POST) 
        if form.is_valid():
            user = form.save(commit=False) #dont save to DB yet because we need to set the password
            user.set_password(form.cleaned_data['password']) #hash the password
            user.save() #save the user to the DB
            messages.success(request, 'registration successful! you can now login.')
            return redirect('/login/') #redirect to login page after successful registration
    else:
        form = RegistrationForm()
    return render(request, 'register.html', {'form': form})
    
# def login_view(request): #to handle user login
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password'] #get the username and password from the form
            user = authenticate(request, username=username, password=password) #checks DB for a user with the given username and password
            if user is not None:
                login(request, user) # creates a session for the user and logs them in
                return redirect('/') #redirect to dashboard after successful login' 
            else:
                messages.error(request, 'Invalid username or password')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form}) 
# def logout_view(request): #to handle user logout    
    # logout(request) #destroy)
    # return redirect('/login/') #redirect to login page after logout     

class CustomAuthToken(ObtainAuthToken):
#custom login endpoint that returns token + user info + notification
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user role
        user_role = self._get_user_role(user)
        
        # Get unread notifications
        notifications = Notification.objects.filter(
            recipient=user,
            is_read=False
        )[:5]  # Last 5 unread
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user_role
            },
            'unread_notifications': NotificationSerializer(notifications, many=True).data,
            'unread_count': Notification.objects.filter(recipient=user, is_read=False).count()
        })
