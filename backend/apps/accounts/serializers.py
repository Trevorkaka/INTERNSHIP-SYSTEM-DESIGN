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
        
        def validate_email(self, value):
        
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("This email is already registered.")
            return value
        
        def validate(self, data):
        
            if data['password'] != data.pop('password_confirm'):
                raise serializers.ValidationError({
                    'password_confirm': 'Passwords do not match.'
                })
        

            role = data.get('role')

            if role == 'student':
                if not data.get('student_number'):
                    raise serializers.ValidationError({
                        'student_number': 'Student number is required for student role.'
                })
            elif role in ['workplace_supervisor', 'academic_supervisor']:
                if not data.get('staff_number'):
                    raise serializers.ValidationError({
                        'staff_number': 'Staff number is required for supervisors.'
                    })
                
            return data
        
        @transaction.atomic
        def create(self, validated_data):
            """Create user with proper password hashing"""
            password = validated_data.pop('password')
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        

class UserLoginSerializer(serializers.Serializer):
    """Simple serializer for login credentials"""
    username = serializers.CharField()
    password = serializers.CharField()


class UserResponseSerializer(serializers.ModelSerializer):
    """Serializer for returning user data (no password)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

        
    
