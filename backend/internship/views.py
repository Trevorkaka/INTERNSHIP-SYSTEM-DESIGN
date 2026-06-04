from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Notification
from .serializers import NotificationSerializer
#from django.http import HttpResponse 

# Create your views here.

# def students(request):
#     return HttpResponse("Welcome to the students page!")
# def register_view(request): #to handle user registration
#     if request.method == 'POST':
#         form = RegistrationForm(request.POST) 
#         if form.is_valid():
#             user = form.save(commit=False) #dont save to DB yet because we need to set the password
#             user.set_password(form.cleaned_data['password']) #hash the password
#             user.save() #save the user to the DB
#             messages.success(request, 'registration successful! you can now login.')
#             return redirect('/login/') #redirect to login page after successful registration
#     else:
#         form = RegistrationForm()
#     return render(request, 'register.html', {'form': form})
    
# def login_view(request): #to handle user login
#     if request.method == 'POST':
#         form = LoginForm(request.POST)
#         if form.is_valid():
#             username = form.cleaned_data['username']
#             password = form.cleaned_data['password'] #get the username and password from the form
#             user = authenticate(request, username=username, password=password) #checks DB for a user with the given username and password
#             if user is not None:
#                 login(request, user) # creates a session for the user and logs them in
#                 return redirect('/') #redirect to dashboard after successful login' 
#             else:
#                 messages.error(request, 'Invalid username or password')
#     else:
#         form = LoginForm()
#     return render(request, 'login.html', {'form': form}) 
# def logout_view(request): #to handle user logout    
#     # logout(request) #destroy)
#     # return redirect('/login/') #redirect to login page after logout     

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
        
        # Get user role (if present on user model)
        user_role = getattr(user, 'role', None)

        # Get unread notifications
        notifications_qs = Notification.objects.filter(
            recipient=user,
            is_read=False
        )[:5]

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user_role,
            },
            'unread_notifications': NotificationSerializer(notifications_qs, many=True).data,
            'unread_count': Notification.objects.filter(recipient=user, is_read=False).count(),
        }, status=status.HTTP_200_OK)

        
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
    EvaluationSerializer, AssessmentSerializer, InternshipPlacementSerializer
)
from .permissions import (
    IsAdmin, IsStudent, IsAcademicSupervisor,
    IsWorkplaceSupervisor, IsAdminOrAcademicSupervisor,
    IsAdminOrAnySupervisor, IsAdminOrReadOnly
)
from .forms import RegistrationForm, LoginForm


# ── JWT Auth ───────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def jwt_login(request):
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

    refresh = RefreshToken.for_user(user)
    notifications = Notification.objects.filter(recipient=user, is_read=False)[:5]

    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
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
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Token is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    """
    POST /api/auth/register/
    Creates user + role profile in one request.
    """
    data = request.data

    # Validate required fields
    for field in ['username', 'email', 'password', 'first_name', 'last_name', 'role']:
        if not data.get(field):
            return Response({field: ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

    if data['role'] not in ['student', 'academic_supervisor', 'workplace_supervisor']:
        return Response(
            {'role': ['Invalid role.']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=data['username']).exists():
        return Response({'username': ['Username already taken.']}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=data['email']).exists():
        return Response({'email': ['Email already registered.']}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
        )

        if data['role'] == 'student':
            Student.objects.create(
                user=user,
                registration_number=data.get('registration_number', ''),
                course=data.get('course', ''),
                year_of_study=int(data.get('year_of_study', 1)),
            )
        elif data['role'] == 'academic_supervisor':
            AcademicSupervisor.objects.create(
                user=user,
                department=data.get('department', ''),
            )
        elif data['role'] == 'workplace_supervisor':
            WorkPlaceSupervisor.objects.create(
                user=user,
                company_name=data.get('company_name', ''),
            )

        return Response({
            'message': 'Account created successfully.',
            'user': {'id': user.id, 'username': user.username, 'role': user.role}
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── ViewSets ───────────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role']
    search_fields    = ['username', 'email', 'first_name', 'last_name']
    ordering_fields  = ['username', 'date_joined']


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'year_of_study']
    search_fields    = ['user__username', 'user__email', 'registration_number',
                        'user__first_name', 'user__last_name']
    ordering_fields  = ['year_of_study']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Student.objects.filter(user=user)
        if user.is_workplace_supervisor:
            return Student.objects.filter(work_place_supervisor=user)
        if user.is_academic_supervisor:
            return Student.objects.filter(academic_supervisor=user)
        return Student.objects.all()

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def assign_supervisors(self, request, pk=None):
        """
        PATCH /api/students/{id}/assign_supervisors/
        Body: { academic_supervisor: user_id, work_place_supervisor: user_id }
        Admin only.
        """
        student = self.get_object()
        academic_id  = request.data.get('academic_supervisor')
        workplace_id = request.data.get('work_place_supervisor')

        if academic_id:
            try:
                student.academic_supervisor = User.objects.get(
                    id=academic_id, role='academic_supervisor'
                )
            except User.DoesNotExist:
                return Response(
                    {'error': f'Academic supervisor with id {academic_id} not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if workplace_id:
            try:
                student.work_place_supervisor = User.objects.get(
                    id=workplace_id, role='workplace_supervisor'
                )
            except User.DoesNotExist:
                return Response(
                    {'error': f'Workplace supervisor with id {workplace_id} not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        student.save()
        return Response(StudentSerializer(student).data, status=status.HTTP_200_OK)


class WorkPlaceSupervisorViewSet(viewsets.ModelViewSet):
    queryset = WorkPlaceSupervisor.objects.all()
    serializer_class = WorkPlaceSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends  = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['company_name']
    search_fields    = ['user__username', 'user__email', 'company_name']


class AcademicSupervisorViewSet(viewsets.ModelViewSet):
    queryset = AcademicSupervisor.objects.all()
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends  = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department']
    search_fields    = ['user__username', 'user__email', 'department']


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all().order_by('-id')
    serializer_class = WeeklyLogSerializer
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'week_number']
    search_fields    = ['activities', 'challenges', 'solutions']
    ordering_fields  = ['week_number', 'submitted_at', 'id']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsStudent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return WeeklyLog.objects.filter(student__user=user).order_by('-id')
        if user.is_academic_supervisor:
            return WeeklyLog.objects.filter(student__academic_supervisor=user).order_by('-id')
        if user.is_workplace_supervisor:
            # ✅ Correct field name: work_place_supervisor
            return WeeklyLog.objects.filter(student__work_place_supervisor=user).order_by('-id')
        return WeeklyLog.objects.all().order_by('-id')

    def perform_create(self, serializer):
        student = self.request.user.student
        serializer.save(student=student)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def submit(self, request, pk=None):
        log = self.get_object()
        if log.student.user != request.user:
            return Response({'error': 'You can only submit your own logs.'}, status=status.HTTP_403_FORBIDDEN)
        if log.status != 'draft':
            return Response({'error': f'Only draft logs can be submitted. Current: {log.status}'}, status=status.HTTP_400_BAD_REQUEST)
        log.status = 'submitted'
        log.submitted_at = timezone.now()
        log.save()
        return Response({'message': f'Week {log.week_number} submitted successfully.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrAnySupervisor])
    def review(self, request, pk=None):
        log = self.get_object()
        if log.status != 'submitted':
            return Response({'error': f'Log must be submitted first. Current: {log.status}'}, status=status.HTTP_400_BAD_REQUEST)
        log.status = 'reviewed'
        log.save()
        return Response({'message': f'Week {log.week_number} marked as reviewed.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        log = self.get_object()
        if log.status != 'reviewed':
            return Response({'error': f'Log must be reviewed first. Current: {log.status}'}, status=status.HTTP_400_BAD_REQUEST)
        log.status = 'approved'
        log.save()
        return Response({'message': f'Week {log.week_number} approved.'}, status=status.HTTP_200_OK)


class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields   = ['name']


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['criteria', 'log__week_number']
    search_fields    = ['feedback']
    ordering_fields  = ['score', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrAnySupervisor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Evaluation.objects.filter(log__student__user=user)
        if user.is_academic_supervisor or user.is_workplace_supervisor:
            return Evaluation.objects.filter(evaluator=user)
        return Evaluation.objects.all()

    def perform_create(self, serializer):
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
            return [IsAdminOrAnySupervisor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Assessment.objects.filter(log__student__user=user)
        return Assessment.objects.all()

    def perform_create(self, serializer):
        # ✅ assessor is set automatically from logged-in user
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
        n = self.get_object()
        n.mark_as_read()
        return Response({'message': 'Marked as read.'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': f'{updated} notifications marked as read.'})


class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends  = [DjangoFilterBackend, SearchFilter]
    search_fields    = ['company_name', 'position']

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return InternshipPlacement.objects.filter(student__user=user)
        return InternshipPlacement.objects.all()


# ── HTML Template Auth Views ───────────────────────────────────────────────────

def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            return redirect('login')
        return render(request, 'register.html', {'form': form})
    return render(request, 'register.html', {'form': RegistrationForm()})


def login_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = authenticate(request,
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'])
            if user:
                login(request, user)
                return redirect('home')
            form.add_error(None, 'Invalid credentials')
            return render(request, 'login.html', {'form': form})
    return render(request, 'login.html', {'form': RegistrationForm()})


@login_required
def logout_view(request):
    logout(request)
    return redirect('login')
