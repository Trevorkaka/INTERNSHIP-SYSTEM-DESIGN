from django.test import TestCase
from django.urls import reverse
from apps.core.models import Student

class CoreModelTest(TestCase):
    def test_student_model_creation(self):
        student = Student.objects.create(
            name='Test Student',
            email='test@example.com',
            course='IT'
        )
        self.assertEqual(student.name, 'Test Student')
        self.assertEqual(str(student), 'Test Student')


class CoreViewTests(TestCase):
    def setUp(self):
        self.student = Student.objects.create(
            name='John Doe',
            email='johndoe@example.com',
            course='Computer Science'
        )

    def test_home_page_resolves_and_renders(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    def test_student_list_renders_with_students(self):
        response = self.client.get(reverse('students'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('students', response.context)
        self.assertEqual(len(response.context['students']), 1)

    def test_add_student_post_success(self):
        response = self.client.post(reverse('add_student'), {
            'name': 'Jane Smith',
            'email': 'janesmith@example.com',
            'course': 'Software Engineering'
        })
        self.assertEqual(response.status_code, 302)  # redirects to student_list
        self.assertTrue(Student.objects.filter(name='Jane Smith').exists())
