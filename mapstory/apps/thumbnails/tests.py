from django.test import TestCase, Client
from unittest import skip

from .models import ThumbnailImage, ThumbnailImageForm

class TestThumbnailImage(TestCase):
    """
    Thumbnail Image model tests
    """
    def setUp(self):
        self.thumbnailImage = ThumbnailImage()
        self.assertIsInstance(self.thumbnailImage, ThumbnailImage)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.thumbnailImage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass

class TestThumbnailImageForm(TestCase):
    """
    ThumbnailImageForm model tests
    """
    def setUp(self):
        self.tif = ThumbnailImageForm()
        self.assertIsInstance(self.tif, ThumbnailImageForm)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.tif))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass
