"""
Views and API ViewSets for the Accounts application.

This module provides custom endpoints and standard DRF ModelViewSets for managing
users, students, and supervisors (academic and workplace). It includes support for:
- API-based Signup, Login, Logout, and Token Refreshment.
- Supervisor assignments to students by administrators.
- Email verification logic.
- Traditional HTML view actions for registration, login, and logout.
"""

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
    Register a new user account via API.

    Validates signup details, registers the user, and immediately generates
    JWT access/refresh tokens to sign them in.

    Args:
        request (Request): REST Framework Request containing registration fields.

    Returns:
        Response: A JSON response detailing success message, created user info,
        and JWT token pairs (201 Created), or validation errors (400 Bad Request).
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
    Authenticate a user via API and return JWT tokens.

    This function validates username/password, authenticates credentials,
    and returns SimpleJWT tokens along with unread notifications for a seamless frontend integration.

    Args:
        request (Request): REST Framework Request containing 'username' and 'password'.

    Returns:
        Response: Authenticated user profile, JWT tokens, unread count and latest unread
        notifications (200 OK), or validation/credential errors (400 Bad Request / 401 Unauthorized).
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
    Log out a user via API by blacklisting their SimpleJWT refresh token.

    Args:
        request (Request): REST Framework Request containing the 'refresh' token in request.data.

    Returns:
        Response: Success response (200 OK) or error response if the refresh token is
        missing or invalid (400 Bad Request).
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
    Generate a new access token using a valid refresh token.

    Args:
        request (Request): REST Framework Request containing the 'refresh' token.

    Returns:
        Response: A new JWT 'access' token (200 OK) or an unauthorized error (401 Unauthorized) if token is invalid.
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
    """
    ModelViewSet for managing CustomUser objects.

    Access is restricted to administrators. Supports advanced filtering by role,
    searching by core fields, and ordering.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']


class StudentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing Student profiles.

    Ensures that students can only fetch/view their own profile data, while admins
    and supervisors have broader access. Includes a custom action to assign supervisors.
    """
    queryset = Student.objects.select_related('user', 'academic_supervisor', 'work_place_supervisor')
    serializer_class = StudentSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'year_of_study']
    search_fields = ['user__username', 'user__email', 'registration_number']
    ordering_fields = ['year_of_study']

    def get_permissions(self):
        """
        Dynamically determine permission classes based on view action.

        - 'list', 'retrieve': Any authenticated user.
        - 'assign_supervisors': Only administrators.
        - Other (create, update, destroy): Admin restricted.

        Returns:
            list: List of instantiated permission classes.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['assign_supervisors']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter queryset based on the requesting user's role.

        - Students see only their own profile.
        - Academic supervisors see only the students assigned to them.
        - Workplace supervisors see only the students assigned to them.
        - Admins see every student.

        Returns:
            QuerySet: Filtered Student query set.
        """
        user = self.request.user
        queryset = self.queryset
        if getattr(user, "is_student", False):
            return queryset.filter(user=user)
        if getattr(user, "is_academic_supervisor", False):
            return queryset.filter(academic_supervisor=user)
        if getattr(user, "is_workplace_supervisor", False):
            return queryset.filter(work_place_supervisor=user)
        return queryset

    @action(detail=True, methods=['patch', 'post'], permission_classes=[IsAdmin])
    def assign_supervisors(self, request, pk=None):
        """
        Assign an academic and/or workplace supervisor to a specific student.

        Args:
            request (Request): Request containing 'academic_supervisor' and/or 'work_place_supervisor' IDs.
            pk (str): Primary key of the Student record to modify.

        Returns:
            Response: Serialized student details (200 OK) or error response (400 Bad Request)
            if a specified supervisor ID does not match the expected role.
        """
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
    """
    ModelViewSet for WorkPlaceSupervisor profiles.

    Permits write access only to administrators, while allowing read operations for all.
    """
    queryset = WorkPlaceSupervisor.objects.select_related('user')
    serializer_class = WorkPlaceSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['company_name']
    search_fields = ['user__username', 'user__email', 'company_name']


class AcademicSupervisorViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for AcademicSupervisor profiles.

    Permits write access only to administrators, while allowing read operations for all.
    """
    queryset = AcademicSupervisor.objects.select_related('user')
    serializer_class = AcademicSupervisorSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department']
    search_fields = ['user__username', 'user__email', 'department']


# --- HTML Authentication Views ---

def register_view(request):
    """
    Handle traditional HTML signup rendering and submission.

    Validates RegistrationForm, hashes the password, and redirects to login on success.

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponse: Rendered registration HTML template.
    """
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
    """
    Handle traditional HTML sign-in rendering and validation.

    Authenticates the credentials, logs the user in to the active session,
    and redirects to home.

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponse: Rendered login HTML template.
    """
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
    """
    Handle traditional HTML session logouts.

    Clears the Django session and redirects the user to the login portal.

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponseRedirect: Redirect to 'login' route.
    """
    logout(request)
    return redirect('login')


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    """
    Confirm user registration and activate user profile via an email verification link.

    Decodes the user's primary key from base64 encoding and verifies the token against
    the user instance. On success, sets `is_active` to True.

    Args:
        request (Request): REST Framework Request object.
        uidb64 (str): Base64-encoded user ID.
        token (str): Single-use password reset / verification token.

    Returns:
        Response: Message confirming successful activation (200 OK) or error message
        explaining invalid token details (400 Bad Request).
    """
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
