from django.shortcuts import render, redirect
from .models import Student
from .forms import StudentForm

# Create your views here.

def student_list(request):
    students = Student.objects.all()
    return render(request, 'students.html', {'students': students})

def add_student(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)#creates a form instance with the submitted data
        if form.is_valid():
            form.save() #saves the new student to the database
            return redirect('/students/') #redirects to the student list page after adding a new student
    else:
        form = StudentForm()#creates an empty form for GET requests

    return render(request, 'add_student.html', {'form': form})    