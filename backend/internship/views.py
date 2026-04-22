from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import (
    User, Student, WorkPlaceSupervisor, AcademicSupervisor,
    WeeklyLog, EvaluationCriteria, Evaluation,
    Assessment, Notification, InternshipPlacement
)
from .serializers import (
    UserSerializer, StudentSerializer, WorkPlaceSupervisorSerializer,
    AcademicSupervisorSerializer, WeeklyLogSerializer,
 EvaluationCriteriaSerializer, NotificationSerializer,
    EvaluationSerializer, AssessmentSerializer
)
from .permissions import (
    IsAdmin, IsAdminOrSelf, IsStudent, IsAcademicSupervisor, 
    IsWorkplaceSupervisor, IsAdminOrAcademicSupervisor, 
    IsAdminOrAnySupervisor, IsAdminOrReadOnly
)
from .forms import RegistrationForm, LoginForm

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin] #Only admins can manage raw user classes.

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Student.objects.filter(user=user)
        return Student.objects.all()
    
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipient=user)
    
class WorkPlaceSupervisorViewSet(viewsets.ModelViewSet):
    queryset = WorkPlaceSupervisor.objects.all()
    serializer_class = WorkPlaceSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]


class AcademicSupervisorViewSet(viewsets.ModelViewSet):
    queryset = AcademicSupervisor.objects.all()
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    
    def get_permissions(self):
        # PERMISSION: Only Students can write or edit logs.
        # Supervisors and Admins can only read them.
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsStudent]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return WeeklyLog.objects.filter(student__user=user)
        elif user.is_academic_supervisor:
            return WeeklyLog.objects.filter(student__academic_supervisor__user=user)
        elif user.is_workplace_supervisor:
            return WeeklyLog.objects.filter(student__workplace_supervisor__user=user)
        return WeeklyLog.objects.all()


class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly] # Only admins can create or edit criteria, but anyone can read them.

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    def get_permissions(self):
        #Only Supervisors and Admins can create or edit grades. 
        #Students can only view their grades.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Evaluation.objects.filter(log__student__user=user)
        elif user.is_academic_supervisor or user.is_workplace_supervisor:
            return Evaluation.objects.filter(evaluator=user)
        return Evaluation.objects.all()


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    
    def get_permissions(self):
        #Same logic as Evaluations. Supervisors grade, Students read.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            # FIX: Assessment links to log, log links to student. Double underscores.
            return Assessment.objects.filter(log__student__user=user)
        return Assessment.objects.all()
    
 # Authentication Views
def register_view(request):
    """Handle user registration"""  
    if request.method == 'POST': 
        # Handle registration logic here
        form = RegistrationForm(request.POST) #take form data from user submission
        if form.is_valid(): #check if data passes all validation rules defined in the form
            user = form.save(commit=False) #create user object but dont save to database yet
            user.set_password(form.cleaned_data['password']) #hash the password before saving
            user.save() #save the user to the database
            return redirect('login') #redirect to login page after successful registration
        else:
            #if form has errors, show form again with error messages
            return render(request, 'register.html', {'form': form}) #show form with error messages
        
    

def login_view(request):
    """Handle user login"""
    if request.method == 'POST':
        # Handle login logic here
        form = LoginForm(request.POST) #take form data from user submission
        if form.is_valid(): #check if form data is valid
            username = form.cleaned_data['username'] #Extract username
            password = form.cleaned_data['password'] #Extract paasword
            user = authenticate(request, username=username, password=password) #check against database for matching user
            if user is not None: #if user credentials are correct
                login(request, user) #Django creates a session for the user
                return redirect('home') #send user to home page after successful login
            else: #If authentication fails, show form again with error message
                form.add_error(None, "Invalid username or password") #Add non-field error to form
                return render(request, 'login.html', {'form': form}) #Show form with error message
                
    #return render(request, 'login.html')


@login_required
def logout_view(request):
    """handle user logout"""
    logout(request)
    return redirect('login')