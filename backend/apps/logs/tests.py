from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import Student
from apps.logs.models import WeeklyLog, Assessment

User = get_user_model()


class WeeklyLogModelTest(TestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='student1',
            email='student1@example.com',
            password='password123',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG123',
            course='Engineering',
            year_of_study=3
        )

    def test_log_creation_and_submit(self):
        log = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Learned Django testing',
            challenges='None',
            solutions='N/A'
        )
        self.assertEqual(log.status, 'draft')
        self.assertEqual(str(log), "week 1 - draft")

        # Call submit
        log.submit()
        self.assertEqual(log.status, 'submitted')


class WeeklyLogAPITests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='studentuser',
            email='student@example.com',
            password='studentpassword',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG001',
            course='Computer Science',
            year_of_study=2
        )

        self.academic_user = User.objects.create_user(
            username='supervisoruser',
            email='supervisor@example.com',
            password='supervisorpassword',
            role='academic_supervisor'
        )
        # Assign academic supervisor to student
        self.student.academic_supervisor = self.academic_user
        self.student.save()

        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword',
            role='admin'
        )

        # Create a log
        self.log = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Wrote tests',
            challenges='None',
            solutions='N/A',
            status='draft'
        )

        self.list_create_url = reverse('weekly-log-list')
        self.submit_url = reverse('weekly-log-submit', kwargs={'pk': self.log.pk})
        self.review_url = reverse('weekly-log-review', kwargs={'pk': self.log.pk})
        self.approve_url = reverse('weekly-log-approve', kwargs={'pk': self.log.pk})

    def test_create_log_auto_associates_student(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            'week_number': 2,
            'activities': 'More testing',
            'challenges': 'None',
            'solutions': 'None'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['week_number'], 2)
        
        # Verify it automatically associated the logged-in student user
        new_log = WeeklyLog.objects.get(week_number=2, student=self.student)
        self.assertEqual(new_log.activities, 'More testing')

    def test_submit_log(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(self.submit_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.log.refresh_from_db()
        self.assertEqual(self.log.status, 'submitted')

    def test_submit_log_already_submitted(self):
        self.log.status = 'submitted'
        self.log.save()

        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(self.submit_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_log_by_supervisor(self):
        self.log.status = 'submitted'
        self.log.save()

        self.client.force_authenticate(user=self.academic_user)
        response = self.client.post(self.review_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.log.refresh_from_db()
        self.assertEqual(self.log.status, 'reviewed')

    def test_review_log_unauthorized_by_student(self):
        self.log.status = 'submitted'
        self.log.save()

        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(self.review_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approve_log_by_admin(self):
        self.log.status = 'reviewed'
        self.log.save()

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.log.refresh_from_db()
        self.assertEqual(self.log.status, 'approved')


class AssessmentAPITests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='studentuser',
            email='student@example.com',
            password='studentpassword',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG001',
            course='IT',
            year_of_study=3
        )
        self.academic_user = User.objects.create_user(
            username='supervisoruser',
            email='supervisor@example.com',
            password='supervisorpassword',
            role='academic_supervisor'
        )
        self.log = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Wrote tests',
            challenges='None',
            solutions='N/A',
            status='submitted'
        )
        self.list_url = reverse('assessment-list')

    def test_create_assessment_by_supervisor(self):
        self.client.force_authenticate(user=self.academic_user)
        data = {
            'log': self.log.id,
            'marks': 95,
            'feedback': 'Excellent work on tests'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['marks'], 95)
        
        # Verify database
        assessment = Assessment.objects.get(log=self.log)
        self.assertEqual(assessment.assessor, self.academic_user)

    def test_create_assessment_unauthorized_by_student(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            'log': self.log.id,
            'marks': 95,
            'feedback': 'Cheat self'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
