from rest_framework import serializers
from internship.models import Assessment, Evaluation, EvaluationCriteria, InternshipPlacement, User, Student, WorkPlaceSupervisor, AcademicSupervisor, WeeklyLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

