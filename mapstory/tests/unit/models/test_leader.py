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
        self.assertIsNotNone(str(self.leader))

    @skip
    def test_save_and_retrieve(self):
        pass
