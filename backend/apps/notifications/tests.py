from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import Student
from apps.logs.models import WeeklyLog, Assessment
from apps.notifications.models import Notification

User = get_user_model()


class NotificationSignalTests(TestCase):
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
            course='Software Engineering',
            year_of_study=3
        )
        self.supervisor = User.objects.create_user(
            username='supervisor1',
            email='supervisor1@example.com',
            password='password123',
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

    def test_assessment_signal_creates_notification(self):
        # Clear existing notifications created by setup/other processes
        Notification.objects.all().delete()

        # Create assessment
        assessment = Assessment.objects.create(
            log=self.log,
            assessor=self.supervisor,
            marks=85,
            feedback='Good work'
        )

        # Check notification creation
        notifications = Notification.objects.filter(recipient=self.student_user)
        self.assertEqual(notifications.count(), 1)
        self.assertEqual(notifications[0].notification_type, 'assessment')
        self.assertEqual(notifications[0].assessment, assessment)

    def test_weekly_log_status_change_creates_notification(self):
        Notification.objects.all().delete()

        # Update log to reviewed
        self.log.status = 'reviewed'
        self.log.save()

        notifications = Notification.objects.filter(recipient=self.student_user, notification_type='log_reviewed')
        self.assertEqual(notifications.count(), 1)

        # Update log to approved
        self.log.status = 'approved'
        self.log.save()

        notifications_approved = Notification.objects.filter(recipient=self.student_user, notification_type='log_approved')
        self.assertEqual(notifications_approved.count(), 1)


class NotificationAPITests(APITestCase):
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
        self.notif1 = Notification.objects.create(
            recipient=self.student_user,
            message='First notification',
            notification_type='placement',
            is_read=False
        )
        self.notif2 = Notification.objects.create(
            recipient=self.student_user,
            message='Second notification',
            notification_type='assessment',
            is_read=False
        )

        self.list_url = reverse('notification-list')
        self.mark_read_url = reverse('notification-mark-as-read', kwargs={'pk': self.notif1.pk})
        self.mark_all_read_url = reverse('notification-mark-all-as-read')

    def test_list_notifications_authenticated(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_mark_single_notification_as_read(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(self.mark_read_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_mark_all_notifications_as_read(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(self.mark_all_read_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.notif1.refresh_from_db()
        self.notif2.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
        self.assertTrue(self.notif2.is_read)
