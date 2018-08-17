from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate, get_user


class TestMapstoryAPI(TestCase):
    """API Tests"""
    def test_documents_api_response(self):
        response = self.client.get("/documents", follow=True)
        self.assertEqual(200, response.status_code)


