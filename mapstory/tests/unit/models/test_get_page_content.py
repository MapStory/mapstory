from unittest import skip
from django.test import TestCase

from mapstory.models import GetPageContent


class TestGetPageContent(TestCase):
    """
    GetPageContent model tests
    """
    def setUp(self):
        self.getPageContent = GetPageContent()
        self.assertIsInstance(self.getPageContent, GetPageContent)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.getPageContent))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass
