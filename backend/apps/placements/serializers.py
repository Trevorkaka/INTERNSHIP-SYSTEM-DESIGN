from rest_framework import serializers
from .models import InternshipPlacement
from apps.accounts.serializers import StudentSerializer


class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.student_id:
            representation['student'] = StudentSerializer(instance.student).data
        return representation

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        if start and end and start >= end:
            raise serializers.ValidationError("End date must be after start date.")
        return data