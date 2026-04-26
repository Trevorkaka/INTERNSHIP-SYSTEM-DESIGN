from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
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
#viewsets
class Uaerviewset(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin] #Only admins can manage raw user classes.

class StudentViewSet(viewsets.ModelviewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_permissions(self):
        #RESTRICT CREATE/UPDATE/DELETE TO ADMINS ONLY
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
    
class WorkPlaceSupervisorViewSet(viewsets.ModelViewSet):
    queryset = WorkPlaceSupervisor.objects.all()
    serializer_class = WorkPlaceSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]


class AcademicSupervisorViewSet(viewsets.Modelview):
    querset = AcademicSupervisor.objects.all()
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer

    def get_permissions(self):
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
            return WeeklyLog.objects.filter(student__academic_supervisor=user)
        elif user.is_workplace_supervisor:
            return WeeklyLog.objects.filter(student__workplace_supervisor=user)
        return WeeklyLog.objects.all()
    
    def perform_create(self, serializer):
        # Automaticaly link the log to the student logged in
        student = self.request.user.student #onetoone reverse relation
        serializer.save(student=student)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent]) 
    def submit(self, request, pk=None):
        """
        POST /api/weekly-logs/{id}/submit/
        changes log status from draft to submitted and records the timestamp.
        """
        log = self.get_object()

        if log.student.user != request.user:
            return Response(
                {'error': 'You can only submit your own logs.'},
                status=status.HTTP_403_FORBIDDEN
        
            )   

        if log.status != 'draft':
            return Response(
                {'error': f'Log is already {log.status}. Only draft logs can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        log.status = 'submitted'
        log.submitted_at = timezone.now()
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log submitted successfully.'},
            status=status.HTTP_200_OK

        )
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrAnySupervisor])
    def review(self, request, pk=None):
        """
        POST /api/weekly-logs/{id}/review/
        Supervisor marks a submitted log as reviewed. This is a simple status change for now, but could be expanded to include feedback comments in the future.
        """
        log = self.get_object()

        if log.status != 'submitted':
            return Response(
                {'error': f'Log must be submitted before it can be reviewed. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST    
            )
        
        log.status = 'reviewed'
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log marked as reviewed.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """
        POST /api/Weekly-logs/{id}/approve/
        Admin approves a reviewed log.
        """
        log = self.get_object()

        if log.status != 'reviewed':
            return Response(
                {'error': f'Log must be reviewed before it can be approved. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST    
            )
        log.status = 'approved'
        log.save()

        return Response(
            {'message': f'Week {log.week_number} log approved.'},
            status=status.HTTP_200_OK
        )

class EvaluationCriterialViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly] # Only admins can create or edit criteria, but anyone can read them.

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

    def get_permissions(self):
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
    
    def perform_create(self, serializer):
        # Automatically set the evaluator to  the logged-in supervisor when creating an evaluation
        serializer.save(evaluator=self.request.user)

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrAnySupervisor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Assessment.objects.filter(log__student__user=user)
        return Assessment.objects.all()
    
    def perform_create(self, serializer):
        # Automatically set the assessor to the logged-in supervisor
        serializer.save(assessor=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        POST /api/notifications/{id}/mark-as-read/
        Marks a single notification as read.
        """
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read.'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        POST /api/notifications/mark_all_as_read/
        Marks ALL of the logged-in user's notifications as read at once.
        """  
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
    
        return Response(
            {'message': f'{updated} notification(s) marked as read.'},
            status=status.HTTP_200_OK
        )
# Authentication Views
def register_view(request):
    """Handle user registration"""
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid(): #check if form data is valid according to the rules defined in the form class
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            return redirect('login')    
        return render(request, 'register.html', {'form': form})
    form = RegistrationForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    """Handle user login"""
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            form.add_error(None, "Invalid username or password")
            return render(request, 'login.html', {'form': form})
    form = LoginForm()
    return render(request, 'login.html', {'form': form})

@login_required
def logout_view(request):
    """Handle user logout"""
    logout(request)
    return redirect('login')


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
 
 