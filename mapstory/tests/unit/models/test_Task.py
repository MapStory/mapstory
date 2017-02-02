from unittest import skip
from django.test import TestCase

from mapstory.models import Task

class TestTask(TestCase):
    """
    Task model tests
    """
    def setUp(self):
        self.task = Task()

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.task))

    @skip("TODO")
    def test_save_and_retrieve(self):
        self.task.save()
