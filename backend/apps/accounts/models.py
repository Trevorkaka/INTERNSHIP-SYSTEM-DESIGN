from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


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

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_academic_supervisor(self):
        return self.role == 'academic_supervisor'

    @property
    def is_workplace_supervisor(self):
        return self.role == 'workplace_supervisor'

    @property
    def is_admin(self):
        return self.role == 'admin'

    def __str__(self):
        return f"{self.username} ({self.role})"


class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    registration_number = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField()
    academic_supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='academic_students'
    )
    work_place_supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='work_place_students'
    )

    def __str__(self):
        return self.user.username


class WorkPlaceSupervisor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username


class AcademicSupervisor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

