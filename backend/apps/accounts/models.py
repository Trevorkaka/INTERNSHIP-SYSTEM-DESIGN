from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class CustomUser(AbstractUser):
    """
    Custom user model representing system users, supporting multiple roles.

    This class extends Django's AbstractUser to incorporate role-based authorization
    and additional profile details such as department, staff number, and student number.

    Attributes:
        ROLE_CHOICES (list of tuple): Allowed roles within the system:
            - 'student': Student pursuing internship.
            - 'workplace_supervisor': Supervisor at the company/organization.
            - 'academic_supervisor': Supervisor from the academic institution.
            - 'admin': System administrator.
        role (CharField): The active role of the user, used for permissions.
        department (CharField): Optional department associated with the user.
        staff_number (CharField): Optional unique identification number for staff members.
        student_number (CharField): Optional unique identification number for students.
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('admin', 'Administrator'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, db_index=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    staff_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    student_number = models.CharField(max_length=50, unique=True, null=True, blank=True)

    @property
    def is_student(self):
        """
        Check if the user is a student.

        Returns:
            bool: True if the user's role is 'student', otherwise False.
        """
        return self.role == 'student'

    @property
    def is_academic_supervisor(self):
        """
        Check if the user is an academic supervisor.

        Returns:
            bool: True if the user's role is 'academic_supervisor', otherwise False.
        """
        return self.role == 'academic_supervisor'

    @property
    def is_workplace_supervisor(self):
        """
        Check if the user is a workplace supervisor.

        Returns:
            bool: True if the user's role is 'workplace_supervisor', otherwise False.
        """
        return self.role == 'workplace_supervisor'

    @property
    def is_admin(self):
        """
        Check if the user is an admin.

        Supports both custom role field and Django superuser for flexibility
        (e.g., when using createsuperuser or admin panel).

        Returns:
            bool: True if role is 'admin' or user.is_superuser is True.
        """
        return self.role == 'admin' or getattr(self, 'is_superuser', False)

    def __str__(self):
        """
        Return the string representation of the user.

        Returns:
            str: Username and role in a formatted string.
        """
        return f"{self.username} ({self.role})"


class Student(models.Model):
    """
    Profile model for student users.

    Stores academic details and relations to supervisors assigned for the student's internship.

    Attributes:
        user (OneToOneField): One-to-one relation to CustomUser (role must be student).
        registration_number (CharField): Official registration or admission number of the student.
        course (CharField): Academic course/program of study.
        year_of_study (IntegerField): Current academic year of study.
        academic_supervisor (ForeignKey): Reference to a CustomUser with the academic supervisor role.
        work_place_supervisor (ForeignKey): Reference to a CustomUser with the workplace supervisor role.
    """
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
        """
        Return string representation of the Student profile.

        Returns:
            str: The student's username.
        """
        return self.user.username


class WorkPlaceSupervisor(models.Model):
    """
    Profile model for workplace supervisor users.

    Stores details about the workplace supervisor's associated organization.

    Attributes:
        user (OneToOneField): One-to-one relation to CustomUser (role must be workplace_supervisor).
        company_name (CharField): Name of the host company or organization where the supervisor works.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=100)

    def __str__(self):
        """
        Return string representation of the workplace supervisor.

        Returns:
            str: The supervisor's username.
        """
        return self.user.username


class AcademicSupervisor(models.Model):
    """
    Profile model for academic supervisor users.

    Stores details about the academic supervisor's department.

    Attributes:
        user (OneToOneField): One-to-one relation to CustomUser (role must be academic_supervisor).
        department (CharField): Academic department the supervisor is affiliated with.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)

    def __str__(self):
        """
        Return string representation of the academic supervisor.

        Returns:
            str: The supervisor's username.
        """
        return self.user.username
