from rest_framework import serializers
from .models import InternshipPlacement
from django.contrib.auth import get_user_model

User = get_user_model()


class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """
        Extra validation at serializer level
        """

        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and start >= end:
            raise serializers.ValidationError("End date must be after start date.")

        return data