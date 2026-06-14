from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import Student, WorkPlaceSupervisor, AcademicSupervisor

User = get_user_model()


class CustomUserModelTest(TestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='student1',
            email='student1@example.com',
            password='password123',
            role='student',
            student_number='S123'
        )
        self.academic_user = User.objects.create_user(
            username='academic1',
            email='academic1@example.com',
            password='password123',
            role='academic_supervisor',
            staff_number='A123'
        )
        self.workplace_user = User.objects.create_user(
            username='workplace1',
            email='workplace1@example.com',
            password='password123',
            role='workplace_supervisor',
            staff_number='W123'
        )
        self.admin_user = User.objects.create_user(
            username='admin1',
            email='admin1@example.com',
            password='password123',
            role='admin'
        )

    def test_user_properties(self):
        self.assertTrue(self.student_user.is_student)
        self.assertFalse(self.student_user.is_academic_supervisor)
        self.assertFalse(self.student_user.is_workplace_supervisor)
        self.assertFalse(self.student_user.is_admin)

        self.assertTrue(self.academic_user.is_academic_supervisor)
        self.assertTrue(self.workplace_user.is_workplace_supervisor)
        self.assertTrue(self.admin_user.is_admin)

    def test_user_str(self):
        self.assertEqual(str(self.student_user), "student1 (student)")


class AccountAPITests(APITestCase):
    def setUp(self):
        self.signup_url = reverse('jwt-signup')
        self.login_url = reverse('jwt-login')
        self.logout_url = reverse('jwt-logout')

        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword',
            role='admin'
        )

    def test_student_signup_success(self):
        data = {
            'username': 'newstudent',
            'email': 'newstudent@example.com',
            'first_name': 'New',
            'last_name': 'Student',
            'password': 'newpassword123',
            'password_confirm': 'newpassword123',
            'role': 'student',
            'student_number': 'STU001',
            'registration_number': 'REG/2026/001',
            'course': 'Computer Science',
            'year_of_study': 3
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'newstudent')
        self.assertTrue(Student.objects.filter(registration_number='REG/2026/001').exists())

    def test_signup_validation_errors(self):
        # Missing student fields
        data = {
            'username': 'badstudent',
            'email': 'badstudent@example.com',
            'first_name': 'Bad',
            'last_name': 'Student',
            'password': 'newpassword123',
            'password_confirm': 'newpassword123',
            'role': 'student'
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Mismatched passwords
        data['password_confirm'] = 'differentpassword'
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            role='student',
            student_number='STU111'
        )
        # Create student profile to avoid any queries issues
        Student.objects.create(
            user=user,
            registration_number='REG/2026/111',
            course='Engineering',
            year_of_study=2
        )

        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_login_invalid_credentials(self):
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudentViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword',
            role='admin'
        )
        self.student_user = User.objects.create_user(
            username='studentuser',
            email='student@example.com',
            password='studentpassword',
            role='student',
            student_number='STU222'
        )
        self.student_profile = Student.objects.create(
            user=self.student_user,
            registration_number='REG222',
            course='IT',
            year_of_study=3
        )
        self.academic_user = User.objects.create_user(
            username='academic',
            email='academic@example.com',
            password='academicpassword',
            role='academic_supervisor',
            staff_number='ACA1'
        )
        AcademicSupervisor.objects.create(
            user=self.academic_user,
            department='Computing'
        )

        # URL
        self.students_list_url = reverse('student-list')
        self.assign_supervisor_url = reverse('student-assign-supervisors', kwargs={'pk': self.student_profile.pk})

    def test_get_queryset_for_student(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.students_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Students should only see their own profile
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.student_profile.id)

    def test_assign_supervisors_by_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'academic_supervisor': self.academic_user.id
        }
        response = self.client.post(self.assign_supervisor_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify changes in DB
        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_profile.academic_supervisor, self.academic_user)

    def test_assign_supervisors_unauthorized(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            'academic_supervisor': self.academic_user.id
        }
        response = self.client.post(self.assign_supervisor_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
