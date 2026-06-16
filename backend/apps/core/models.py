"""
Models for the Core application.

Defines fundamental models that represent system elements, including early-stage
or legacy models (such as Student for reference or historical integrations).
"""

from django.db import models


class Student(models.Model):
    """
    Core Student model used for core referencing or basic student listings.

    Attributes:
        name (CharField): Official name of the student.
        email (EmailField): Contact email address.
        course (CharField): Academic course/program of study.
    """
    name = models.CharField(max_length=100)
    email = models.EmailField()
    course = models.CharField(max_length=100)

    def __str__(self):
        """
        String representation of the student.

        Returns:
            str: Name of the student.
        """
        return self.name
