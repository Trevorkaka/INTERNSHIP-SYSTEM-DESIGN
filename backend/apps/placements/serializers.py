from rest_framework import serializers
from .models import InternshipPlacement
from apps.accounts.serializers import StudentSerializer


from apps.accounts.models import Student

class InternshipPlacementSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )

    class Meta:
        model = InternshipPlacement
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["student"] = StudentSerializer(instance.student).data
        return data
    
    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        if start and end and start >= end:
            raise serializers.ValidationError("End date must be after start date.")
        return data