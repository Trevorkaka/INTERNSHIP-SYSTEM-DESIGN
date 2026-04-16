from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('academic_supervisor', 'Academic_supervisor'),
        ('workplace_supervisor', 'Workplace_supervisor'),
        ('admin', 'Administrator'),
        )
    role = models.CharField(max_length=30, choices = ROLE_CHOICES )
    @property
    def is_student(self):
        return self.role == 'student'
    @property
    def is_academic_supervisor(self):
        return self.role == 'academic_supervisor'
    
    @property
    def is_workplace_supervisor(self):
        return self.role == 'workplace_supervisor'

    def __str__(self):
        return f"{self.username} ({self.role})"
    




#    groups = models.ManyToManyField(
 #       Group,
  #      related_name='custom_user_set',
   #     blank=True,
   # )
   # user_permissions = models.ManyToManyField(
    #    Permission,
    #    related_name='custom_user_permissions_set',
    #    blank=True,
    #)

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
    registration_number = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year_of_study = models.IntegerField()
    academic_supervisor = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete = models.SET_NULL, null = True, 
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
      user = models. OneToOneField(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
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


     def __str__(self):
        return f"week {self.week_number} -{self.status}"
     
class Assessment(models.Model):
    log = models.ForeignKey(weeklylog, on_delete=models.CASCADE)
    assessor = models.ForeignKey(User, on_delete=models.CASCADE)
    marks= models.IntegerField()
    feedback= models.TextField()
    assessed_at = models.DateTimeField(auto_now_add = True)


    def __str__(self):
        return f"{self.assessor.username}-week{self.log.week_number}"
    

class internshipPlacement(models.Model):
     student = models.OneToOneField(Student, on_delete= models.CASCADE)
     company_name = models.CharField(max_length= 100)
     position = models.CharField(max_length= 100)
     start_date= models.DateField()
     end_date = models.DateField()


     def __str__(self):
        return f"{self.student.user.username} - {self.company_name}"
     

class EvaluationCriteria(models.Model):
     name = models.CharField(max_length=100)
     max_score = models.IntegerField()

     def __str__(self):
        return self.name
     
class Evaluation(models.Model):
    log = models.ForeignKey(weeklylog, on_delete= models.CASCADE)
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete= models.CASCADE)
    score = models.IntegerField()
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add = True)


    def __str__(self):
        return f"{self.evaluator.username} - {self.criteria.name}"
