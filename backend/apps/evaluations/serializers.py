from rest_framework import serializers
from .models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    """
    Serializer for Evaluation.

    Prevents manual editing of total_score.
    """

    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ['total_score', 'evaluated_at']

    def validate(self, data):
        """
        Additional validation at API level.
        """

        for field in ['technical_score', 'communication_score', 'professionalism_score']:
            value = data.get(field)
            if value is not None and not (0 <= value <= 100):
                raise serializers.ValidationError(
                    f"{field} must be between 0 and 100."
                )

        return data