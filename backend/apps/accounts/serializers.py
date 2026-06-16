from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator
from django.db import transaction
from .models import Student, WorkPlaceSupervisor, AcademicSupervisor

User = get_user_model()


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8, required=False)
    email = serializers.EmailField(validators=[EmailValidator()])

    registration_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    course = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year_of_study = serializers.IntegerField(write_only=True, required=False)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'role', 
            'department', 'staff_number', 'student_number',
            'registration_number', 'course', 'year_of_study', 'company_name'
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
        # Support missing or empty password_confirm by falling back to password
        password_confirm = data.pop('password_confirm', None)
        if password_confirm is None:
            password_confirm = data.get('password')

        if data.get('password') != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })

        role = data.get('role')

        if role == 'student':
            if not data.get('student_number'):
                # Fallback to registration_number if student_number is missing
                reg_num = data.get('registration_number')
                if reg_num:
                    data['student_number'] = reg_num
                else:
                    raise serializers.ValidationError({
                        'student_number': 'Student number is required for student role.'
                    })
            if not data.get('registration_number'):
                raise serializers.ValidationError({
                    'registration_number': 'Registration number is required for student role.'
                })
            if not data.get('course'):
                raise serializers.ValidationError({
                    'course': 'Course is required for student role.'
                })
            if not data.get('year_of_study'):
                raise serializers.ValidationError({
                    'year_of_study': 'Year of study is required for student role.'
                })

            # Check uniqueness of student_number (registration_number)
            student_num = data.get('student_number')
            if User.objects.filter(student_number__iexact=student_num).exists():
                raise serializers.ValidationError({
                    'registration_number': 'This student registration number is already registered.'
                })

        elif role == 'workplace_supervisor':
            if not data.get('staff_number'):
                # Fallback to a generated/username-based staff_number
                username = data.get('username')
                if username:
                    data['staff_number'] = f"W-{username}"
                else:
                    raise serializers.ValidationError({
                        'staff_number': 'Staff number is required for workplace supervisors.'
                    })
            if not data.get('company_name'):
                raise serializers.ValidationError({
                    'company_name': 'Company name is required for workplace supervisors.'
                })

            # Check uniqueness of staff_number
            staff_num = data.get('staff_number')
            if User.objects.filter(staff_number__iexact=staff_num).exists():
                raise serializers.ValidationError({
                    'staff_number': 'This staff number is already registered.'
                })

        elif role == 'academic_supervisor':
            if not data.get('staff_number'):
                # Fallback to a generated/username-based staff_number
                username = data.get('username')
                if username:
                    data['staff_number'] = f"A-{username}"
                else:
                    raise serializers.ValidationError({
                        'staff_number': 'Staff number is required for academic supervisors.'
                    })
            if not data.get('department'):
                raise serializers.ValidationError({
                    'department': 'Department is required for academic supervisors.'
                })

            # Check uniqueness of staff_number
            staff_num = data.get('staff_number')
            if User.objects.filter(staff_number__iexact=staff_num).exists():
                raise serializers.ValidationError({
                    'staff_number': 'This staff number is already registered.'
                })
            
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """Create user with proper password hashing and profile creation"""
        registration_number = validated_data.pop('registration_number', '')
        course = validated_data.pop('course', '')
        year_of_study = validated_data.pop('year_of_study', None)
        company_name = validated_data.pop('company_name', '')

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Create corresponding profile
        if user.role == 'student':
            Student.objects.create(
                user=user,
                registration_number=registration_number,
                course=course,
                year_of_study=year_of_study or 1
            )
        elif user.role == 'workplace_supervisor':
            WorkPlaceSupervisor.objects.create(
                user=user,
                company_name=company_name
            )
        elif user.role == 'academic_supervisor':
            AcademicSupervisor.objects.create(
                user=user,
                department=user.department or ''
            )

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


class UserSerializer(serializers.ModelSerializer):
    is_student = serializers.BooleanField(read_only=True)
    is_academic_supervisor = serializers.BooleanField(read_only=True)
    is_workplace_supervisor = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'is_student', 'is_academic_supervisor',
            'is_workplace_supervisor', 'is_admin'
        ]
        read_only_fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'is_student', 'is_academic_supervisor',
            'is_workplace_supervisor', 'is_admin'
        ]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


class WorkPlaceSupervisorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = WorkPlaceSupervisor
        fields = '__all__'


class AcademicSupervisorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AcademicSupervisor
        fields = '__all__'
