from unittest import skip

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.test import TestCase

from mapstory.tasks import append_feature_chunks

from ...tests.AdminClient import AdminClient
from ...tests.MapStoryTestMixin import MapStoryTestMixin
from ...utils import Link, error_response, parse_schema


class WFST_Template(object):
    def format(self, features, workspace, workspace_uri, handle):
        pass


class TestTasks(MapStoryTestMixin):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_append_feature_chunks(self):
        append_feature_chunks(['a', 'b', 'c'], WFST_Template(), "A", "B")
