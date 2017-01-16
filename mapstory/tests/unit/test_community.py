import tempfile
from unittest import skip
from django.test import TestCase

from mapstory.models import Community

testImage = tempfile.NamedTemporaryFile(suffix=".jpg")

class TestCommunity(TestCase):
    """
    Community model tests
    """
    def setUp(self):
        self.community = Community(name="Testing 1", icon=testImage)
        self.assertIsInstance(self.community, Community)

    def test_import(self):
        self.assertIsNotNone(Community)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.community))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass

    @skip("TODO")
    def test_url(self):
        pass

    @skip("TODO")
    def test_image_tag(self):
        pass
