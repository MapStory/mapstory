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



class TestGuestVisitor(TestCase):
    """
    New visitor functional tests. (User not logged in)
    """

    @skip('TODO')
    def test_can_explore(self):
        """
        The guest user should be able to explore the data
        """
        pass

    @skip('TODO')
    def test_redirect_on_create(self):
        """
        The user should be presented witht he login/signup when clicking 'Create'
        """
        pass

    @skip('TODO')
    def test_get_started(self):
        """
        Guest user should be able to read "get started"
        """
        pass

    @skip('TODO')
    def test_journal(self):
        """
        Guest user should be able to see the Journal
        """
        pass


class TestSignup(TestCase):
    """
    A guest can signup for an account
    """

    @skip('TODO')
    def test_signup(self):
        """
        Should be able to create new account using signup form
        """
        pass

    @skip('TODO')
    def test_created_account_login(self):
        """
        Should login with the newly created account
        """
        pass


class TestLogin(TestCase):
    """
    An existing user can identify himself
    """

    @skip('TODO')
    def test_restricted_access(self):
        """
        Should restrict access to guest users
        """
        pass

    @skip('TODO')
    def test_admin_login(self):
        """
        Should login admin
        """
        pass

    @skip('TODO')
    def test_user_login(self):
        """
        Should login with a user
        """
        pass

    @skip('TODO')
    def test_can_access_restricted(self):
        """
        Logged in user can access restricted
        """
        pass


"""
Admin can login
"""

"""
Logged in user can create a new map story: `/maps/new`
    Redirects to tour: `/maps/new?tour`
"""

"""
A User can compose a story
"""
class TestStoryComposer(TestCase):
    @skip("TODO")
    def test_composer_loads(self):
        """
        Can take a tour ...
        Can compose a story...
        """
        pass

    def test_import_mapstory(self):
        self.assertIsNotNone(MapStory)

    def test_import_map(self):
        self.assertIsNotNone(Map)

    def test_create_new_mapStory(self):
        user = User.objects.create_user(username='john',
                                 email='jlennon@beatles.com',
                                 password='glassonion')

        """
        Can compose a story

        *  New story form:
            - Title (text)(required)
            - Summary (text)
            - Category (dropdown) 'Health'
            - Tags (text)
            - Location (dropdown) 'Africa'
        """
        # Should create an instance of mapstory
        mapstory = MapStory()
        self.assertIsInstance(mapstory, MapStory)
        mapstory.title = "Test story"
        mapstory.owner = user
        mapstory.save()

    def test_create_new_map(self):
        testMap = Map()
        self.assertIsInstance(testMap, Map)

    @skip("TODO")
    def test_save_story_draft(self):
        """
        Can save draft story
        """
        user = User.objects.create_user(username='john',
                                 email='jlennon@beatles.com',
                                 password='glassonion')
        mapstory = MapStory()
        self.assertIsInstance(mapstory, MapStory)
        mapstory.title = "Test story"
        mapstory.owner = user
        mapstory.save()

        testMap = Map()
        testMap.story = mapstory
        testMap.zoom = 3
        testMap.projection = "EPSG:900913"
        testMap.center_x = -7377090.47385893
        testMap.center_y = 3463514.6256579063
        testMap.owner = user
        testMap.save()

    @skip("TODO")
    def test_publish_story(self):
        """
        Can publish a story
        """
        pass

    @skip("TODO")
    def test_edit_properties(self):
        """
        Can edit properties of story
        """
        pass

    @skip("TODO")
    def test_story_get_help(self):
        """
        Can get help from story by pressing the Help button
        """
        pass

    @skip("TODO")
    def test_chapter_list(self):
        """
        Can list chapters
        """

    @skip("TODO")
    def test_add_new_chapter(self):
        """
        Can add a new chapter (Form)

        + Chapter Title
        + Chapter Summary
        + Choose Your Basemap (dropdown)
          + 'World Light'
        + Set Current Zoom (button)
        + Data Playback
          + Instant (button)
          + Cumulative (button)
        + Save Chapter Info (button)
        """
        pass

    @skip("TODO")
    def test_edit_chapter(self):
        """
        Can edit a chapter

        * Chapter Title
        * Chapter Summary
        * Choose Your Basemap
        * Can set current zoom
        * 'Current View Set' success
        * Saves corrertly
        """
        pass

    @skip("TODO")
    def test_remove_chapter(self):
        """
        Can remove a chapter
        """
        pass

    @skip("TODO")
    def test_add_layer_to_chapter(self):
        """
        Can add storylayer

        + Shows `/maps/new?tour#add-layer-dialog`
        + Can search for a layer
        + Can select a layer
        + (PLEASE!) Can create a new layer !!!
        """
        pass

    @skip("TODO")
    def test_remove_layer_from_chapter(self):
        """
        Can add storylayer

        + Shows `/maps/new?tour#add-layer-dialog`
        + Can search for a layer
        + Can select a layer
        + (PLEASE!) Can create a new layer !!!
        """
        pass

    @skip("TODO")
    def test_add_storybox_to_chapter(self):
        """
        Can add storybox (Form)

        + Tile (text)
        + Description (text)
        + Update Map Bounds (button)
        + Start Time (date) (time)
        + End Time (date) (time)
        + Can save storybox
        """
        pass

    @skip("TODO")
    def test_edit_storybox(self):
        """
        Can edit storybox
        """

    @skip("TODO")
    def test_remove_storybox_from_chapter(self):
        """
        Can remove storybox
        """

    @skip("TODO")
    def test_add_storypin_to_chapter(self):
        """
        Can add storypin
        """
