from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from .models import Organization


class TestOrganizations(TestCase):
    """Organizations' Tests.
    """
    def test_create_and_add_members(self):
        self.assertTrue(False)

    def test_organization_url_resolves(self):
        pass
