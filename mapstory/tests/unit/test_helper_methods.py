from unittest import skip
from django.test import TestCase

from mapstory.models import _stamp
from mapstory.models import get_images
from mapstory.models import get_sponsors


class MockInstance(object):
    """
    Helper Mock Instance
    """
    name = 'A name'


class TestHelperMethods(TestCase):
    """
    Model helper methods tests
    """
    def test_stamp(self):
        """
        Should return a hash
        """
        self.assertIsNotNone(_stamp("Hola!"))
        self.assertEqual(_stamp("123"),_stamp("123"))
        self.assertNotEqual(_stamp("123"), _stamp("321"))

    def test_stamp_params(self):
        """
        Should only stamp strings or buffers
        """
        self.assertRaises(TypeError, _stamp, 123)

    def test_stamp_returns(self):
        """
        Should be 8 in length
        """
        self.assertEqual(len(_stamp("456")), 8)
        self.assertEqual(len(_stamp("45685739391")), 8)
        self.assertEqual(len(_stamp("")), 8)
        self.assertEqual(len(_stamp("AaaaaaaaaAAaaAAAAaaA")), 8)

    def test_get_images(self):
        self.assertIsNotNone(get_images())
        # Should return an array
        self.assertIsNotNone(get_images().count())
        self.assertEqual(get_images().count(), 0)

    def test_get_sponsors(self):
        sponsors = get_sponsors()
        self.assertIsNotNone(sponsors)
        self.assertEqual(sponsors.count(), 0)

    @skip("TODO")
    def test_group_journals(self):
        pass

    @skip("TODO")
    def test_mapstory_profile_post_save(self):
        pass
