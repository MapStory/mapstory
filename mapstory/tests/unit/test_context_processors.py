from datetime import datetime
from unittest import skip

from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from django.test.utils import override_settings

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.context_processors_favorite import get_object_of_interest


class MockLayerRequest(object):

    path = '/layers/test'


class MockMapRequest(object):

    path = '/maps/21'


class MockStoryRequest(object):

    path = '/story/22'


class TestContextProcessors(MapStoryTestMixin):

    def setUp(self):
        pass

    def test_layer_request(self):
       get_object_of_interest(MockLayerRequest())

    def test_map_request(self):
       get_object_of_interest(MockMapRequest())

    def test_story_request(self):
       get_object_of_interest(MockStoryRequest())
