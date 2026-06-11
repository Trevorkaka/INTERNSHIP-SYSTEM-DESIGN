from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import Student
from apps.logs.models import WeeklyLog
from apps.evaluations.models import Evaluation, EvaluationCriteria

User = get_user_model()


class EvaluationModelTest(TestCase):
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
            course='Computer Science',
            year_of_study=3
        )
        self.log = WeeklyLog.objects.create(
            student=self.student,
            week_number=1,
            activities='Wrote tests',
            challenges='None',
            solutions='N/A'
        )
        self.supervisor = User.objects.create_user(
            username='supervisor1',
            email='supervisor1@example.com',
            password='password123',
            role='academic_supervisor'
        )

    def test_calculate_total_score_on_save(self):
        evaluation = Evaluation.objects.create(
            weekly_log=self.log,
            evaluator=self.supervisor,
            technical_score=Decimal('10.00'),
            communication_score=Decimal('8.00'),
            professionalism_score=Decimal('9.00')
        )
        # (10 * 0.4) + (8 * 0.3) + (9 * 0.3) = 4 + 2.4 + 2.7 = 9.1
        self.assertEqual(evaluation.total_score, Decimal('9.10'))


class EvaluationAPITests(APITestCase):
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
        
        self.criteria = EvaluationCriteria.objects.create(
            name='Code Quality',
            max_score=10,
            weight_percentage=Decimal('100.00')
        )

        self.evaluation = Evaluation.objects.create(
            log=self.log,
            evaluator=self.academic_user,
            criteria=self.criteria,
            score=8,
            feedback='Good job',
            weekly_log=self.log,
            technical_score=Decimal('8.0'),
            communication_score=Decimal('8.0'),
            professionalism_score=Decimal('8.0')
        )

        self.list_create_url = reverse('evaluation-list')

    def test_list_evaluations_student_sees_own(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_evaluation_by_supervisor(self):
        self.client.force_authenticate(user=self.academic_user)
        other_log = WeeklyLog.objects.create(
            student=self.student,
            week_number=2,
            activities='Wrote more tests',
            challenges='None',
            solutions='N/A',
            status='submitted'
        )

        data = {
            'weekly_log': other_log.id,
            'technical_score': '9.00',
            'communication_score': '9.00',
            'professionalism_score': '9.00',
            'feedback': 'Amazing performance!'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total_score'], '9.00')

        # Verify evaluator is set automatically
        new_evaluation = Evaluation.objects.get(weekly_log=other_log)
        self.assertEqual(new_evaluation.evaluator, self.academic_user)

    def test_create_evaluation_unauthorized_by_student(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            'weekly_log': self.log.id,
            'technical_score': '9.00',
            'communication_score': '9.00',
            'professionalism_score': '9.00'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
