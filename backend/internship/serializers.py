from rest_framework import serializers
from internship.models import Assessment, Evaluation, EvaluationCriteria, InternshipPlacement, User, Student, WorkPlaceSupervisor, AcademicSupervisor, WeeklyLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) #Shows all the students details. this is a nested serializer that allows us to access the related user details when we serialize a student instance.

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

class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLog
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'


    




