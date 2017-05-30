from unittest import skip

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.test import TestCase

from ...tests.MapStoryTestMixin import MapStoryTestMixin
from ...tests.AdminClient import AdminClient
from ...utils import parse_schema, error_response, Link

from mapstory.tasks import append_feature_chunks


class WFST_Template(object):
    def format(self, features, workspace, workspace_uri, handle):
        pass


class TestTasks(MapStoryTestMixin):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_append_feature_chunks(self):
        append_feature_chunks(['a','b','c'], WFST_Template(), "A", "B")