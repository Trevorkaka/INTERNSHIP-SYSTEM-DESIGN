from asyncio import run

from django.shortcuts import render, redirect #to render the html templates and redirect to other pages
from django.contrib.auth import authenticate, login, logout #to handle user authentication
from django.contrib import messages #to display messages to the user
from .forms import RegistrationForm, LoginForm #importing the forms we created in forms.py
#from django.http import HttpResponse 

# Create your views here.

#def students(request):
    #return HttpResponse("Welcome to the students page!")
def register_view(request): #to handle user registration
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
    
def login_view(request): #to handle user login
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
def logout_view(request): #to handle user logout    
    logout(request) #destroy)
    return redirect('/login/') #redirect to login page after logout     
