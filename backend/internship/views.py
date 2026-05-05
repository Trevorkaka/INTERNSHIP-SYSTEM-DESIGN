from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django_filters.rest_framework import DjangoFilterBackend
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

#--JWT Auth API Views ---------------------

@api_view(['POST'])
@permission_classes([AllowAny])  # No auth needed to log in
def jwt_login(request):
    """
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    Returns: access token, refresh token, user info, unread notifications
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT token pair for the user
    refresh = RefreshToken.for_user(user)

    # Fetch last 5 unread notifications to send with login response
    notifications = Notification.objects.filter(recipient=user, is_read=False)[:5]
    
    return Response({
        'access':  str(refresh.access_token),  # Short-lived (60 min)
        'refresh': str(refresh),                # Long-lived (7 days)
        'user': {
            'id':         user.id,
            'username':   user.username,
            'email':      user.email,
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'role':       user.role,
        },
        'unread_notifications': NotificationSerializer(notifications, many=True).data,
        'unread_count': Notification.objects.filter(recipient=user, is_read=False).count(),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def jwt_logout(request):
    """
    POST /api/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Blacklists the refresh token so it can't be used again.
    Requires: Authorization: Bearer <access_token>
    """
    refresh_token = request.data.get('refresh')

    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required to log out.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # Invalidate this refresh token permanently
        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_200_OK
        )
    
    except TokenError:
        return Response(
            {'error': 'Token is invalid or already expired.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
#---------viewsets------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin] #Only admins can manage raw user classes.

    filter_backends  =   [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields =   ['role']
    search_fields    =   ['username', 'email', 'first_name', 'last_name']
    ordering_fields  =   ['username', 'date_joined']


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    filter_backends  =  [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields =  ['course', 'year_of_study']
    search_fields    =  ['user__username', 'user__email','registration_number']
    ordering_fields  =  ['year_of_study']

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

    filter_backends   =  [DjangoFilterBackend, SearchFilter]
    filterset_fields  =  ['company_name']
    search_fields     =  ['user__username', 'user_email', 'company_name']

class AcademicSupervisorViewSet(viewsets.ModelViewSet):
    queryset = AcademicSupervisor.objects.all()
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends  = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department']
    search_fields    = ['user__username', 'user__email', 'department']


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'week_number']
    search_fields    = ['activities','challenges', 'solutions']  
    ordering_fields  = ['week_number', 'submitted_at']

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

class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly] # Only admins can create or edit criteria, but anyone can read them.
    
    filter_backends  = [SearchFilter, OrderingFilter]
    search_fields    = ['name']
    ordering_fields  = ['name', 'max_score']

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields    = ['criteria', 'log__week_number']
    search_fields    = ['feedback']
    ordering_field   = ['score','created_at']   

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

    
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['log__week_number']
    search_fields    = ['feedback']
    ordering_fields  = ['marks', 'assessed_at']

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

    
    filter_backends  = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields  = ['created_at']


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

