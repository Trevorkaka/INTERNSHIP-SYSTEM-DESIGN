from django.apps import AppConfig


class InternshipConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.internship'

    def ready (self):
        import apps.internship.signals
