"""
Views for the Core application.

Handles standard HTML pages such as the landing/home page, student listing pages,
and student profile addition forms.
"""

from django.shortcuts import render, redirect
from .models import Student
from .forms import StudentForm
from django.http import HttpResponse


def home(request):
    """
    Render the homepage of the Internship Logbook & Evaluation System (ILES).

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponse: Rendered homepage using the base HTML template.
    """
    return render(request, 'base.html')


def student_list(request):
    """
    Retrieve and display a list of all active students.

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponse: Rendered student listing page.
    """
    students = Student.objects.all()
    return render(request, 'students.html', {'students': students})


def add_student(request):
    """
    Render form and handle new student record submission.

    Validates StudentForm on POST submission and redirects to the student list page
    upon successful creation.

    Args:
        request (HttpRequest): Standard Django HttpRequest object.

    Returns:
        HttpResponse: Rendered add-student form template.
    """
    if request.method == 'POST':
        form = StudentForm(request.POST)  # Creates a form instance with the submitted data
        if form.is_valid():
            form.save()  # Saves the new student to the database
            return redirect('/students/')  # Redirects to student list
    else:
        form = StudentForm()  # Creates an empty form for GET requests

    return render(request, 'add_student.html', {'form': form})    
