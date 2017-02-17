from unittest import skip

from django.core.urlresolvers import reverse
from django.test import TestCase

from mapstory.mapstories.models import MapStory

from ...version import get_version
from ... import __version__ as version
from ..MapStoryTestMixin import MapStoryTestMixin
from ..utils import get_test_user, create_mapstory
from ...forms import KeywordsForm, PublishStatusForm

testUser = get_test_user()


class TestMapstory(TestCase):
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



class TestMapstoryVersion(TestCase):
    def test_did_import(self):
        self.assertIsNotNone(get_version)

    def test_get_version(self):
        self.assertIsNotNone(get_version(None))
        self.assertEqual(get_version(), "1.0c0")
        self.assertEqual(get_version(version=version), "1.0c0")



class MapViewsTest(MapStoryTestMixin):
    def test_mapstory_detail_view(self):
        testMapstory = create_mapstory(testUser, 'Testing Map 01')
        self.assertIsNotNone(testMapstory)
        self.assertIsNotNone(testMapstory.id)

        # Should exist in the database
        found = MapStory.objects.get(id=testMapstory.id)
        self.assertEquals(found.title, testMapstory.title)
        # Should get a 200 response from the URL
        response = self.client.get(reverse('mapstory_detail', kwargs={"mapid": testMapstory.id}))
        self.assertEquals(response.status_code, 200)

        # Should use the correct template
        self.assertTemplateUsed(response, 'maps/map_detail.html')
        self.assertContains(response, testMapstory.title)

    def test_post_mapstory_detail_keyword_post(self):
        # Should create add a keyword
        testMapstory = create_mapstory(testUser, 'Testing Map 02')
        response = self.client.post(reverse('mapstory_detail', kwargs={"mapid": testMapstory.id}), {'add_keyword': 'test_keyword'})
        self.assertEquals(response.status_code, 200)

        # Should remove the keyword
        response = self.client.post(reverse('mapstory_detail', kwargs={"mapid": testMapstory.id}),
                                    {'remove_keyword': 'test_keyword'})

        self.assertEquals(response.status_code, 200)

        # Should handle Keywords form post
        form_data = {'keywords': ['testKeyword01','testKeyword02','testKeyword03']}
        form = KeywordsForm(data=form_data)
        self.assertTrue(form.is_valid())
        response = self.client.post(reverse('mapstory_detail', kwargs={"mapid": testMapstory.id}), form_data)
        self.assertEquals(response.status_code, 200)

    def test_mapstory_detail_publish_status_form(self):
        # Should not be published yet
        testMapstory = create_mapstory(testUser, 'Testing Map 03')
        self.assertFalse(testMapstory.is_published)

        # Send POST
        form_data = {'is_published': True, 'published_submit_btn': True}
        form = PublishStatusForm(data=form_data)
        self.assertTrue(form.is_valid())
        response = self.client.post(reverse('mapstory_detail', kwargs={"mapid": testMapstory.id}), form_data)
        self.assertEquals(response.status_code, 200)

        # Should be published
        testMapstory = MapStory.objects.get(id=testMapstory.id)
        self.assertTrue(testMapstory.is_published)




