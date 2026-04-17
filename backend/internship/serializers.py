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



