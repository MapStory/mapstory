from unittest import skip
from django.test import TestCase

from mapstory.models import GetPage


class TestGetPage(TestCase):
    """
    GetPage model tests
    """
    def setUp(self):
        self.getPage = GetPage()
        self.assertIsInstance(self.getPage, GetPage)

    def test_import(self):
        self.assertIsNotNone(GetPage)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.getPage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        self.getPage.save()
