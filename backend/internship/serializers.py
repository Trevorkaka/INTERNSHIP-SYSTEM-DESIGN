from rest_framework import serializers
from .models import (
    Assessment, Evaluation, EvaluationCriteria,
    InternshipPlacement, Notification, User,
    Student, WorkPlaceSupervisor, AcademicSupervisor, WeeklyLog
)


class UserSerializer(serializers.ModelSerializer):
    is_student             = serializers.BooleanField(read_only=True)
    is_academic_supervisor = serializers.BooleanField(read_only=True)
    is_workplace_supervisor= serializers.BooleanField(read_only=True)
    is_admin               = serializers.BooleanField(read_only=True)

    class Meta:
        model  = User
        fields = ['id','username','email','role','first_name','last_name',
                  'is_student','is_academic_supervisor','is_workplace_supervisor','is_admin']
        read_only_fields = ['role','is_student','is_academic_supervisor',
                            'is_workplace_supervisor','is_admin']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model  = Student
        fields = '__all__'

class WorkPlaceSupervisorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model  = WorkPlaceSupervisor
        fields = '__all__'

class AcademicSupervisorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model  = AcademicSupervisor
        fields = '__all__'

class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WeeklyLog
        fields = '__all__'
        read_only_fields = ['status', 'submitted_at', 'student']

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Assessment
        fields = '__all__'
        read_only_fields = ['assessor', 'assessed_at']  # ✅ assessor set by perform_create

class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EvaluationCriteria
        fields = '__all__'

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Evaluation
        fields = '__all__'
        read_only_fields = ['evaluator', 'created_at']

class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InternshipPlacement
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = '__all__'
