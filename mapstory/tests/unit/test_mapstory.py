from unittest import skip

from django.test import TestCase
from django.contrib.auth import get_user_model

from geonode.maps.models import MapStory

User = get_user_model()

def getTestUser():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User 
    """
    allUsers = User.objects.all()
    if allUsers.count() > 0 :
        return allUsers[0]
    else :
        return User.objects.create_user(username='modeltester',
                                 email='modeltester@models.com',
                                 password='glassonion232123')

# Get a user for testing
testUser = getTestUser()

class TestMapstoryModel(TestCase):
    """
    Mapstory Model Tests
    """
    def setUp(self):
        self.mapstory = MapStory()
        self.assertIsInstance(self.mapstory, MapStory, "Should be instance of MapStory")
        self.mapstory.title = "Test story"
        self.mapstory.owner = testUser
    
    def test_save_and_retrieve(self):
        """
        Should save in database
        """
        self.assertEqual(0, MapStory.objects.all().count())
        self.mapstory.save()
        self.assertEqual(1, MapStory.objects.all().count())
        savedMapStory = MapStory.objects.all()[0]
        self.assertEqual(savedMapStory.title, "Test story", "Should have the same title")
        self.assertEqual(savedMapStory.owner, self.mapstory.owner, "Should have the same owner")

    def test_remove(self):
        self.assertEqual(0, MapStory.objects.all().count())
        self.mapstory.save()
        self.assertEqual(1, MapStory.objects.all().count())
        MapStory.objects.filter(id=self.mapstory.id).delete()
        self.assertEqual(0, MapStory.objects.all().count())

    @skip("TODO: Fix")
    def test_get_abosolute_url(self):
        self.assertIsNotNone(self.mapstory.get_absolute_url())

    @skip("TODO: Fix this test")
    def test_update_from_viewer(self):
        conf = {}
        conf.title = "Test"
        conf.abstract = "Test abstract"
        conf.is_published = True
        self.mapstory.update_from_viewer(conf)
