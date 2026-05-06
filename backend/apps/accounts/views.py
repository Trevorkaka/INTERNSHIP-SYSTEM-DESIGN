from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import (
    UserSignupSerializer,
    UserLoginSerializer,
    UserResponseSerializer,
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Register a new user account.
    
    Required fields:
    - username (str): Unique username, min 3 chars
    - email (str): Valid email address
    - password (str): Min 8 characters
    - password_confirm (str): Must match password
    - first_name (str): User's first name
    - last_name (str): User's last name
    - role (str): One of ['student', 'workplace_supervisor', 'academic_supervisor', 'admin']
    
    Role-specific required fields:
    - student: student_number
    - supervisor roles: staff_number
    
    Optional:
    - department (str)
    """
    serializer = UserSignupSerializer(data=request.data)

