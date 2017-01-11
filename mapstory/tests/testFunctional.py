"""
MapStory Functional Tests
"""
from django.test import TestCase
from unittest import skip
from .AdminClient import AdminClient
from django.core.urlresolvers import reverse

from geonode.maps.models import Map
from geonode.maps.models import MapStory

from django.contrib.auth import get_user_model
# Gets the custom user model
User = get_user_model()

class TestStoryComposer(TestCase):

    def test_import_mapstory(self):
        self.assertIsNotNone(MapStory)


    def test_import_map(self):
        self.assertIsNotNone(Map)


    def test_create_new_mapStory(self):
        user = User.objects.create_user(username='john',
                                 email='jlennon@beatles.com',
                                 password='glassonion')
        mapstory = MapStory()
        self.assertIsInstance(mapstory, MapStory)
        mapstory.title = "Test story"
        mapstory.owner = user
        mapstory.save()


    def test_create_new_map(self):
        testMap = Map()
        self.assertIsInstance(testMap, Map)

