from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator
from django.db import transaction

User = get_user_model()


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(validators=[EmailValidator()])

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'role', 
            'department', 'staff_number', 'student_number'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }

        def validate_username(self, value):
            
            if len(value) < 3:
                raise serializers.ValidationError("Username must be at least 3 characters long.")
            if User.objects.filter(username__iexact=value).exists():
                raise serializers.ValidationError("This username is already taken.")
            return value
    