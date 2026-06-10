from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes

from apps.common.permissions import IsAdmin, IsAdminOrReadOnly
from .models import Student, WorkPlaceSupervisor, AcademicSupervisor
from .serializers import (
    UserSignupSerializer,
    UserLoginSerializer,
    UserResponseSerializer,
    UserSerializer,
    StudentSerializer,
    WorkPlaceSupervisorSerializer,
    AcademicSupervisorSerializer,
)
from .forms import RegistrationForm, LoginForm
from .tokens import email_verification_token

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Register a new user account.
    """
    serializer = UserSignupSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens for new user
        refresh = RefreshToken.for_user(user)
        response_serializer = UserResponseSerializer(user)
        
        return Response({
            'message': 'Account created successfully!',
            'user': response_serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens.
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    response_serializer = UserResponseSerializer(user)
    
    # Fetch unread notifications for response to match frontend expectations
    from apps.notifications.models import Notification
    from apps.notifications.serializers import NotificationSerializer
    notifications = Notification.objects.filter(recipient=user, is_read=False)[:5]
    
    return Response({
        'message': 'Login successful!',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        },
        'unread_notifications': NotificationSerializer(notifications, many=True).data,
        'unread_count': Notification.objects.filter(recipient=user, is_read=False).count(),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting the refresh token.
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Logged out successfully!'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh the access token using the refresh token.
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        
        return Response({
            'access': str(token.access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


# --- ViewSets for accounts models ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'academic_supervisor', 'work_place_supervisor')
    serializer_class = StudentSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'year_of_study']
    search_fields = ['user__username', 'user__email', 'registration_number']
    ordering_fields = ['year_of_study']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['assign_supervisors']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(user=user)
        return queryset

    @action(detail=True, methods=['patch', 'post'], permission_classes=[IsAdmin])
    def assign_supervisors(self, request, pk=None):
        student = self.get_object()
        academic_id = request.data.get('academic_supervisor')
        workplace_id = request.data.get('work_place_supervisor')
        
        if academic_id is not None:
            if academic_id == "" or academic_id == 0:
                student.academic_supervisor = None
            else:
                try:
                    supervisor_user = User.objects.get(id=academic_id, role='academic_supervisor')
                    student.academic_supervisor = supervisor_user
                except User.DoesNotExist:
                    return Response(
                        {'error': f'Academic supervisor with user ID {academic_id} does not exist or is not an academic supervisor.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
        if workplace_id is not None:
            if workplace_id == "" or workplace_id == 0:
                student.work_place_supervisor = None
            else:
                try:
                    supervisor_user = User.objects.get(id=workplace_id, role='workplace_supervisor')
                    student.work_place_supervisor = supervisor_user
                except User.DoesNotExist:
                    return Response(
                        {'error': f'Workplace supervisor with user ID {workplace_id} does not exist or is not a workplace supervisor.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        student.save()
        return Response(StudentSerializer(student).data, status=status.HTTP_200_OK)


class WorkPlaceSupervisorViewSet(viewsets.ModelViewSet):
    queryset = WorkPlaceSupervisor.objects.select_related('user')
    serializer_class = WorkPlaceSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['company_name']
    search_fields = ['user__username', 'user__email', 'company_name']


class AcademicSupervisorViewSet(viewsets.ModelViewSet):
    queryset = AcademicSupervisor.objects.select_related('user')
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department']
    search_fields = ['user__username', 'user__email', 'department']


# --- HTML Authentication Views ---

def register_view(request):
    """Handle user registration"""
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
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


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except Exception as e:
        return Response({
            'error': 'Invalid verification link',
            'details': str(e)
        }, status=400)

    if email_verification_token.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({
            'message': 'Email verified successfully'
        }, status=200)

    return Response({
        'error': 'Invalid or expired token'
    }, status=400)
