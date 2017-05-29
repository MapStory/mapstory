from unittest import skip
from django.test import TestCase
from mapstory.models import ContentMixin


class TestContentMixin(TestCase):
    def setUp(self):
        self.contentMixin = ContentMixin(content="<a href=%s target='_'>")

    def test_import(self):
        self.assertIsNotNone(ContentMixin)

    @skip("Fix this")
    def test_save_and_retrieve(self):
        self.contentMixin.save()
        saved = ContentMixin.objects.all()
        self.assertEqual(saved.count, 1)

    def test_html(self):
        self.assertTrue(self.contentMixin.html().strip().startswith("<"))
        self.assertTrue(self.contentMixin.html().endswith(">"))
