from unittest import skip
from django.test import TestCase

from mapstory.models import ParallaxImage


class TestParallaxImage(TestCase):
    """
    ParallaxImage model tests
    """
    def setUp(self):
        self.parallaxImage = ParallaxImage()
        self.assertIsInstance(self.parallaxImage, ParallaxImage)

    @skip("TODO")
    def test_unicode(self):
        self.assertIsNotNone(unicode(self.parallaxImage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass
