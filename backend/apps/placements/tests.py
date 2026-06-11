import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import Student
from apps.placements.models import InternshipPlacement

User = get_user_model()


class InternshipPlacementModelTest(TestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='student1',
            email='student1@example.com',
            password='password123',
            role='student',
            student_number='S123'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG123',
            course='Software Engineering',
            year_of_study=3
        )
        self.workplace_sup = User.objects.create_user(
            username='workplace1',
            email='workplace1@example.com',
            password='password123',
            role='workplace_supervisor',
            staff_number='W123'
        )
        self.academic_sup = User.objects.create_user(
            username='academic1',
            email='academic1@example.com',
            password='password123',
            role='academic_supervisor',
            staff_number='A123'
        )

    def test_placement_creation_success(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            workplace_supervisor=self.workplace_sup,
            academic_supervisor=self.academic_sup,
            company_name='TechCorp',
            position='Developer Intern',
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 8, 31)
        )
        self.assertEqual(placement.company_name, 'TechCorp')
        self.assertEqual(str(placement), f"{self.student} - TechCorp (2026-06-01 to 2026-08-31)")

    def test_placement_invalid_dates(self):
        placement = InternshipPlacement(
            student=self.student,
            workplace_supervisor=self.workplace_sup,
            academic_supervisor=self.academic_sup,
            company_name='TechCorp',
            start_date=datetime.date(2026, 8, 31),
            end_date=datetime.date(2026, 6, 1)  # end date is before start date
        )
        with self.assertRaises(ValidationError):
            placement.save()


class PlacementAPITests(APITestCase):
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
        self.student = Student.objects.create(
            user=self.student_user,
            registration_number='REG222',
            course='IT',
            year_of_study=3
        )
        self.workplace_sup = User.objects.create_user(
            username='workplace2',
            email='workplace2@example.com',
            password='password123',
            role='workplace_supervisor',
            staff_number='W124'
        )
        self.academic_sup = User.objects.create_user(
            username='academic2',
            email='academic2@example.com',
            password='password123',
            role='academic_supervisor',
            staff_number='A124'
        )
        
        self.placement = InternshipPlacement.objects.create(
            student=self.student,
            workplace_supervisor=self.workplace_sup,
            academic_supervisor=self.academic_sup,
            company_name='Innovate Ltd',
            position='QA Intern',
            start_date=datetime.date(2026, 6, 1),
            end_date=datetime.date(2026, 8, 30)
        )

        self.list_create_url = reverse('placement-list')
        self.detail_url = reverse('placement-detail', kwargs={'pk': self.placement.pk})

    def test_list_placements_authenticated(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_placement_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        # Create another student for the new placement
        other_student_user = User.objects.create_user(
            username='otherstudent',
            email='other@example.com',
            password='password123',
            role='student',
            student_number='STU333'
        )
        other_student = Student.objects.create(
            user=other_student_user,
            registration_number='REG333',
            course='CS',
            year_of_study=4
        )

        data = {
            'student': other_student.id,
            'workplace_supervisor': self.workplace_sup.id,
            'academic_supervisor': self.academic_sup.id,
            'company_name': 'NewTech',
            'position': 'Frontend Intern',
            'start_date': '2026-07-01',
            'end_date': '2026-09-30'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['company_name'], 'NewTech')

    def test_create_placement_unauthorized(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            'student': self.student.id,
            'workplace_supervisor': self.workplace_sup.id,
            'academic_supervisor': self.academic_sup.id,
            'company_name': 'NewTech',
            'position': 'Frontend Intern',
            'start_date': '2026-07-01',
            'end_date': '2026-09-30'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
