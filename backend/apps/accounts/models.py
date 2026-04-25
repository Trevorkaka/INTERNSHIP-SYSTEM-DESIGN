from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('admin', 'Administrator'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    department = models.CharField(max_length=100, blank=True, null=True)
    staff_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    student_number = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
