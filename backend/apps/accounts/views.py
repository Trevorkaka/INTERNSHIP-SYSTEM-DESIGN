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

