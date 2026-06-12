from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import (
    Student, WorkPlaceSupervisor, AcademicSupervisor
)
from apps.logs.models import (
    WeeklyLog, Assessment
)
from apps.evaluations.models import (
    EvaluationCriteria, Evaluation
)
from apps.notifications.models import (
    Notification
)

User = get_user_model()

class InternshipBackendTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword123',
            role='admin'
        )
        
        # Create academic supervisor
        self.academic_user = User.objects.create_user(
            username='academic_sup',
            email='academic@example.com',
            password='password123',
            role='academic_supervisor'
        )
        self.academic_supervisor = AcademicSupervisor.objects.create(
            user=self.academic_user,
            department='Computer Science'
        )

        # Create workplace supervisor
        self.workplace_user = User.objects.create_user(
            username='workplace_sup',
            email='workplace@example.com',
            password='password123',
            role='workplace_supervisor'
        )
        self.workplace_supervisor = WorkPlaceSupervisor.objects.create(
            user=self.workplace_user,
            company_name='Tech Corp'
        )

        # Create student user
        self.student_user = User.objects.create_user(
            username='student1',
            email='student@example.com',
            password='password123',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG/001',
            course='BSE',
            year_of_study=3,
            academic_supervisor=self.academic_user,
            work_place_supervisor=self.workplace_user
        )

        # Evaluation criteria
        self.criteria = EvaluationCriteria.objects.create(
            name='Punctuality',
            max_score=10
        )

    def test_jwt_login_success(self):
        url = reverse('jwt-login')
        data = {
            'username': 'student1',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'student1')
        self.assertEqual(response.data['user']['role'], 'student')

    def test_jwt_login_invalid_credentials(self):
        url = reverse('jwt-login')
        data = {
            'username': 'student1',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_weekly_log_lifecycle(self):
        # Authenticate as student
        self.client.force_authenticate(user=self.student_user)
        
        # Create Weekly Log (Draft)
        url = reverse('weekly-log-list')
        data = {
            'week_number': 1,
            'activities': 'Learned Django views and models.',
            'challenges': 'None',
            'solutions': 'N/A'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        log_id = response.data['id']
        self.assertEqual(response.data['status'], 'draft')
        
        # Submit Weekly Log
        submit_url = reverse('weekly-log-submit', kwargs={'pk': log_id})
        response = self.client.post(submit_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Confirm status is now 'submitted'
        response = self.client.get(reverse('weekly-log-detail', kwargs={'pk': log_id}))
        self.assertEqual(response.data['status'], 'submitted')
        
        # Authenticate as supervisor to review
        self.client.force_authenticate(user=self.academic_user)
        review_url = reverse('weekly-log-review', kwargs={'pk': log_id})
        response = self.client.post(review_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Confirm status is now 'reviewed'
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(reverse('weekly-log-detail', kwargs={'pk': log_id}))
        self.assertEqual(response.data['status'], 'reviewed')

        # Authenticate as Admin to approve
        self.client.force_authenticate(user=self.admin_user)
        approve_url = reverse('weekly-log-approve', kwargs={'pk': log_id})
        response = self.client.post(approve_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Confirm status is now 'approved'
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(reverse('weekly-log-detail', kwargs={'pk': log_id}))
        self.assertEqual(response.data['status'], 'approved')

    def test_weekly_log_queryset_filtering(self):
        # Create logs for student
        log1 = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Log 1',
            challenges='None',
            solutions='None',
            status='submitted'
        )

        # Academic supervisor should see it
        self.client.force_authenticate(user=self.academic_user)
        url = reverse('weekly-log-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 1)

        # Workplace supervisor should also see it (using the fixed query filter)
        self.client.force_authenticate(user=self.workplace_user)
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 1)

        # Another unrelated user should not see it
        unrelated_user = User.objects.create_user(
            username='unrelated',
            email='unrelated@example.com',
            password='password123',
            role='academic_supervisor'
        )
        AcademicSupervisor.objects.create(user=unrelated_user, department='Chemistry')
        self.client.force_authenticate(user=unrelated_user)
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)

    def test_workplace_supervisor_search(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('workplace-supervisor-list')
        
        # Test searching with double underscore path (user__email and user__username)
        response = self.client.get(url + '?search=workplace')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['company_name'], 'Tech Corp')

    def test_evaluations_and_criteria(self):
        log = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Log 1',
            challenges='None',
            solutions='None',
            status='reviewed'
        )
        
        # Authenticate as workplace supervisor
        self.client.force_authenticate(user=self.workplace_user)
        
        # Create Evaluation
        url = reverse('evaluation-list')
        data = {
            'log': log.id,
            'criteria': self.criteria.id,
            'score': 8,
            'feedback': 'Excellent punctuality!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['score'], 8)
        self.assertEqual(response.data['evaluator'], self.workplace_user.id)

    def test_student_signup_creates_profile(self):
        url = reverse('jwt-register')
        data = {
            'username': 'new_student',
            'email': 'new_student@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'New',
            'last_name': 'Student',
            'role': 'student',
            'student_number': 'STU123456',
            'registration_number': 'REG/CS/2026',
            'course': 'Computer Science',
            'year_of_study': 2
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user is created
        user_exists = User.objects.filter(username='new_student').exists()
        self.assertTrue(user_exists)
        user = User.objects.get(username='new_student')
        self.assertEqual(user.role, 'student')
        
        # Verify Student profile is automatically created
        student_exists = Student.objects.filter(user=user).exists()
        self.assertTrue(student_exists)
        student = Student.objects.get(user=user)
        self.assertEqual(student.registration_number, 'REG/CS/2026')
        self.assertEqual(student.course, 'Computer Science')
        self.assertEqual(student.year_of_study, 2)

    def test_supervisor_signup_creates_profile(self):
        # Workplace supervisor
        url = reverse('jwt-register')
        data = {
            'username': 'new_work_sup',
            'email': 'new_work@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'Work',
            'last_name': 'Sup',
            'role': 'workplace_supervisor',
            'staff_number': 'STAFF987',
            'company_name': 'New Tech Inc'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(username='new_work_sup')
        self.assertTrue(WorkPlaceSupervisor.objects.filter(user=user).exists())
        self.assertEqual(WorkPlaceSupervisor.objects.get(user=user).company_name, 'New Tech Inc')

        # Academic supervisor
        data = {
            'username': 'new_acad_sup',
            'email': 'new_acad@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'Acad',
            'last_name': 'Sup',
            'role': 'academic_supervisor',
            'staff_number': 'STAFF654',
            'department': 'Mechanical Engineering'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(username='new_acad_sup')
        self.assertTrue(AcademicSupervisor.objects.filter(user=user).exists())

    def test_assign_supervisors_action(self):
        # Create unassigned student
        user = User.objects.create_user(
            username='unassigned_student',
            email='unassigned@example.com',
            password='password123',
            role='student'
        )
        student = Student.objects.create(
            user=user,
            registration_number='REG/UN/01',
            course='Information Technology',
            year_of_study=3
        )
        
        # Authenticate as admin
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('student-assign-supervisors', kwargs={'pk': student.id})
        data = {
            'academic_supervisor': self.academic_user.id,
            'work_place_supervisor': self.workplace_user.id
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh student and assert
        student.refresh_from_db()
        self.assertEqual(student.academic_supervisor, self.academic_user)
        self.assertEqual(student.work_place_supervisor, self.workplace_user)
