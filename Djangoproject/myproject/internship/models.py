from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('supervisor', 'Supervisor'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True,
    )

    class Student(models.Model):
        User = models.OneToOneField(User, on_delete= models.CASCADE)
        registration_number = models.CharField(max_length=100)
        course = models.CharField(max_length=100)
        year_of_study = models.IntegerField()
        academic_supervisor = models.ForeignKey (User, on_delete = models.SET_NULL, null = True, 
                                            related_name= 'academic_students')
        work_place_supervisor= models.ForeignKey (User, on_delete= models.SET_NULL, null=True,
                                             related_name= 'work_place_students')
        
        def __str__(self):
            return self.user.username
        

class work_place_supervisor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username
        
        
class Academic_supervisor(models.Model):
      user = models. OneToOneField(User, on_delete= models.CASCADE)
      department = models.CharField(max_length=100)

      def __str__(self):
        return self.user.username
      
class weeklylog(models.Model):
     STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved')
        )
     student = models.ForeignKey(Student, on_delete= models.CASCADE)
     week_number = models.IntegerField()
     activities= models.TextField()
     challenges= models.TextField()
     solutions= models.TextField()
     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
     submitted_at= models.DateTimeField(null=True, blank=True)

     def submit(self):
        self.status = "submitted"
        self.save()