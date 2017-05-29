from unittest import skip
from django.test import TestCase

from mapstory.models import Leader


class TestLeader(TestCase):
    """
    Leader model tests
    """
    def setUp(self):
        self.leader = Leader()
        self.assertIsInstance(self.leader, Leader)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.leader))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass
