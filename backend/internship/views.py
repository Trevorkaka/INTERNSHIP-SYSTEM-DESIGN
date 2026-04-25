from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
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

class CustomAuthToken(ObtainAuthToken):
    """custom login end point that returns token + user info + notifications
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({
                'error':'Invalid credentials'
            }, status = status.HTTP_401_UNAUTHORIZED)
        token, created = Token.objects.get_or_create(user=user)

        #get user role
        user_role = self._get_user_role(user)

        #get unread notifications
        notifications = Notification.objects.filter(
            recipient=user,
            is_read = False
        )[:5] # last 5 unread

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
    

    def _get_user_role(self, user):
        """Determine user's role"""
        if Student.objects.filter(user=user).exists():
            return 'student'
        elif AcademicSupervisor.objects.filter(user=user).exists():
            return 'academic_supervisor'
        elif WorkPlaceSupervisor.objects.filter(user=user).exists():
            return 'workplace_supervisor'
        return 'unknown'
 
 

    









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
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get only unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response({
            'unread_count': notifications.count(),
            'notifications': serializer.data  
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark single notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({
            'status': 'notification marked as read',
            'notification': self.get_serializer(notification).data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.update(is_read=True)
        return Response({
            'status': f'{count} notifications marked as read'
        })
    
     @action(detail=False, methods=['post'])
    def clear_all(self, request):
        """Delete all notifications"""
        count = self.get_queryset().delete()[0]
        return Response({
            'status': f'{count} notifications deleted'
        })
    
    
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
    else:
        #get request, show empty registration form
        form = RegistrationForm() #create an empty form instance
        #now returns the form
        return render(request, 'register.html', {'form': form})    
    

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
    else:
        # GET request - show empty login form
        form = LoginForm()
    return render(request, 'login.html', {'form': form})


@login_required
def logout_view(request):
    """handle user logout"""
    logout(request)
    return redirect('login')