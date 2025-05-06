from django.test import TestCase
from django.contrib.auth.models import User
from .models import Document, Version
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class DocumentModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        
        # Create a test document
        self.document = Document.objects.create(
            title='Test Document',
            description='Test Description',
            created_by=self.user
        )
    
    def test_document_creation(self):
        """Test document creation and string representation"""
        self.assertEqual(self.document.title, 'Test Document')
        self.assertEqual(self.document.description, 'Test Description')
        self.assertEqual(str(self.document), 'Test Document')
        
    def test_document_slug_generation(self):
        """Test that slugs are automatically generated"""
        self.assertEqual(self.document.slug, 'test-document')

class DocumentAPITest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        
        # Create a test document
        self.document = Document.objects.create(
            title='Test Document',
            description='Test Description',
            created_by=self.user
        )
        
        # Authenticate the test client
        self.client.force_authenticate(user=self.user)
    
    def test_get_documents_list(self):
        """Test retrieving the document list"""
        url = reverse('document-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

class AdminSiteTest(TestCase):
    def setUp(self):
        # Create admin user - use a unique username to avoid conflicts
        self.admin_user = User.objects.create_superuser(
            username='admin_test_user',  # Changed username to be more unique
            email='admin@example.com',
            password='adminpassword'
        )
        
        # Create regular user - use a unique username to avoid conflicts
        self.regular_user = User.objects.create_user(
            username='regular_test_user',  # Changed username to be more unique
            email='regular@example.com',
            password='regularpassword'
        )
        
        # Create a test document
        self.document = Document.objects.create(
            title='Admin Test Document',
            description='Admin Test Description',
            created_by=self.admin_user
        )
    
    def test_admin_login(self):
        """Test admin login functionality"""
        # Login to admin site with the user created in setUp
        login_successful = self.client.login(
            username='admin_test_user',  # Match the username from setUp
            password='adminpassword'
        )
        self.assertTrue(login_successful)
    
    def test_admin_document_list(self):
        """Test admin document list view"""
        # Login as admin with the user created in setUp
        self.client.login(username='admin_test_user', password='adminpassword')  # Match the username from setUp
        
        # Access the document admin page
        url = reverse('admin:documents_document_changelist')
        response = self.client.get(url)
        
        # Check that the page loaded successfully
        self.assertEqual(response.status_code, 200)
        
        # Check that our test document is in the response
        self.assertContains(response, 'Admin Test Document')
    
    def test_admin_access_denied_for_regular_user(self):
        """Test that regular users cannot access admin"""
        # Login as regular user with the user created in setUp
        self.client.login(username='regular_test_user', password='regularpassword')  # Match the username from setUp
        
        # Try to access admin page
        url = reverse('admin:index')
        response = self.client.get(url)
        
        # Should be redirected to login page (302 status code)
        self.assertEqual(response.status_code, 302)