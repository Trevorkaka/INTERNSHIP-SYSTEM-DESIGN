from rest_framework import serializers
from .models import EvaluationCriteria, Evaluation


class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = '__all__'


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ['evaluator', 'created_at', 'total_score']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.log:
            representation['log'] = {
                'id': instance.log.id,
                'week_number': instance.log.week_number,
                'activities': instance.log.activities,
            }
        if instance.criteria:
            representation['criteria'] = {
                'id': instance.criteria.id,
                'name': instance.criteria.name,
                'max_score': instance.criteria.max_score,
            }
        return representation
