from django.db import migrations


DEFAULT_CRITERIA = [
    ('Technical Skills', 10, 40),
    ('Communication', 10, 30),
    ('Professionalism', 10, 30),
]


def seed_default_criteria(apps, schema_editor):
    EvaluationCriteria = apps.get_model('evaluations', 'EvaluationCriteria')
    for name, max_score, weight in DEFAULT_CRITERIA:
        EvaluationCriteria.objects.get_or_create(
            name=name,
            defaults={
                'max_score': max_score,
                'weight_percentage': weight,
                'is_active': True,
            },
        )


def remove_default_criteria(apps, schema_editor):
    EvaluationCriteria = apps.get_model('evaluations', 'EvaluationCriteria')
    EvaluationCriteria.objects.filter(name__in=[c[0] for c in DEFAULT_CRITERIA]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('evaluations', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_criteria, remove_default_criteria),
    ]
