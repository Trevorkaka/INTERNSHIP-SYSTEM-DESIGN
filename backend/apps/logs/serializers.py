from rest_framework import serializers
from .models import WeeklyLog
from django.utils import timezone



class WeeklyLogSerializer(serializers.ModelSerializer):
    """
    Serializer for WeeklyLog.

    Prevents editing restricted fields after submission.
    """

    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = [
            'status',
            'submitted_at',
            'reviewed_at',
            'supervisor_comments'
        ]

    def validate(self, data):
        """
        Additional validation for deadlines.
        """

        deadline = data.get('deadline')

        if deadline and deadline < timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")

        return data