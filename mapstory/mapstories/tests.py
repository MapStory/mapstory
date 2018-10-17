from unittest import skip

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import Client, TestCase

from bs4 import BeautifulSoup
from mapstory.forms import KeywordsForm, PublishStatusForm
from mapstory.mapstories.models import Map, MapStory
from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.utils import create_mapstory

# Gets the custom user model
User = get_user_model()
testUser = User.objects.all().first()
testUser.set_password("admin")
testUser.save()


class TestMapstory(TestCase):
    """
    Mapstory Model Tests
    """

    def setUp(self):
        self.mapstory = MapStory()
        self.assertIsInstance(self.mapstory, MapStory,
                              "Should be instance of MapStory")
        self.mapstory.title = "Test story"
        self.mapstory.owner = testUser

    def test_save_and_retrieve(self):
        """
        Should save in database
        """
        self.client.login(username=testUser.username, password="admin")
        self.assertEqual(0, MapStory.objects.all().count())
        self.mapstory.save()
        self.assertEqual(1, MapStory.objects.all().count())
        saved_mapstory = MapStory.objects.all()[0]
        self.assertEqual(saved_mapstory.title, "Test story",
                         "Should have the same title")
        self.assertEqual(saved_mapstory.owner,
                         self.mapstory.owner, "Should have the same owner")

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

    def test_create_new_mapstory(self):
        user = User.objects.create_user(username='john',
                                        email='jlennon@beatles.com',
                                        password='glassonion')
        mapstory = MapStory()
        self.assertIsInstance(mapstory, MapStory)
        mapstory.title = "Test story"
        mapstory.owner = user
        mapstory.save()

    def test_create_new_map(self):
        test_map = Map()
        self.assertIsInstance(test_map, Map)


class MapViewsTest(MapStoryTestMixin):
    def test_mapstory_detail_view(self):
        test_mapstory = create_mapstory(testUser, 'Testing Map 01')
        self.assertIsNotNone(test_mapstory)
        self.assertIsNotNone(test_mapstory.id)

        # Should exist in the database
        found = MapStory.objects.get(id=test_mapstory.id)
        self.assertEquals(found.title, test_mapstory.title)
        self.client.login(username=testUser.username, password="admin")
        # Should get a 200 response from the URL
        response = self.client.get(
            reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
        self.assertEquals(response.status_code, 200)

        # Should use the correct template
        self.assertTemplateUsed(response, 'maps/map_detail.html')
        self.assertContains(response, test_mapstory.title)

    def test_post_mapstory_detail_keyword_post(self):
        # Should create add a keyword
        test_mapstory = create_mapstory(testUser, 'Testing Map 02')
        self.client.login(username=testUser.username, password="admin")
        response = self.client.post(reverse('mapstory_detail', kwargs={
                                    "slug": test_mapstory.slug}), {'add_keyword': 'test_keyword'})
        self.assertEquals(response.status_code, 200)

        # Should remove the keyword
        response = self.client.post(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}),
                                    {'remove_keyword': 'test_keyword'})

        self.assertEquals(response.status_code, 200)

        # Should handle Keywords form post
        form_data = {'keywords': ['testKeyword01',
                                  'testKeyword02', 'testKeyword03']}
        form = KeywordsForm(data=form_data)
        self.assertTrue(form.is_valid())
        response = self.client.post(reverse('mapstory_detail', kwargs={
                                    "slug": test_mapstory.slug}), form_data)
        self.assertEquals(response.status_code, 200)

    def test_mapstory_detail_publish_status_form(self):
        # Should not be published yet
        test_mapstory = create_mapstory(testUser, 'Testing Map 03')
        self.assertFalse(test_mapstory.is_published)

        # Send POST
        form_data = {'is_published': True, 'published_submit_btn': True}
        form = PublishStatusForm(data=form_data)
        self.assertTrue(form.is_valid())
        self.client.login(username=testUser.username, password="admin")
        response = self.client.post(reverse('mapstory_detail',
                                            kwargs={"slug": test_mapstory.slug}), form_data)
        self.assertEquals(response.status_code, 200)

        # Should be published
        test_mapstory = MapStory.objects.get(id=test_mapstory.id)
        self.assertTrue(test_mapstory.is_published)

    def test_mapstory_twitter_cards(self):
        test_mapstory = create_mapstory(testUser, 'Testing Map 04')
        self.assertIsNotNone(test_mapstory)
        self.assertIsNotNone(test_mapstory.id)

        # Should get a 200 response from the URL
        self.client.login(username=testUser.username, password="admin")
        response = self.client.get(
            reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
        self.assertEquals(response.status_code, 200)

        # Should use the correct template
        self.assertTemplateUsed(response, 'maps/map_detail.html')
        self.assertContains(response, test_mapstory.title)

        # Should have the meta tags included
        soup = BeautifulSoup(response.content, "html.parser")
        card_type = soup.findAll(attrs={"name": "twitter:card"})
        title = soup.findAll(attrs={"name": "twitter:title"})
        description = soup.findAll(attrs={"name": "twitter:description"})
        image = soup.findAll(attrs={"name": "twitter:image"})
        site = soup.findAll(attrs={"name": "twitter:site"})

        # Assert we have the correct values
        self.assertEqual(card_type[0]['content'].encode('utf-8'), "summary")
        self.assertEqual(title[0]['content'].encode(
            'utf-8'), test_mapstory.title)
        self.assertTrue(
            test_mapstory.abstract in description[0]['content'].encode('utf-8'))
        self.assertIsNotNone(image[0]['content'].encode('utf-8'))
        self.assertEqual(site[0]['content'].encode('utf-8'), "@mapstory")

    def test_mapstory_details_share_buttons(self):
        test_mapstory = create_mapstory(testUser, 'Testing Map 05')
        self.assertIsNotNone(test_mapstory)
        self.assertIsNotNone(test_mapstory.id)

        # Should get a 200 response from the URL
        self.client.login(username=testUser.username, password="admin")
        response = self.client.get(
            reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
        self.assertEquals(response.status_code, 200)

        # Should have the meta tags included
        soup = BeautifulSoup(response.content, "html.parser")
        twitter_icon = soup.findAll("a", {"class": "share-btn twitter"})
        google_icon = soup.findAll("a", {"class": "share-btn google-plus"})
        facebook_icon = soup.findAll("a", {"class": "share-btn facebook"})
        stumble_icon = soup.findAll("a", {"class": "share-btn stumbleupon"})
        reddit_icon = soup.findAll("a", {"class": "share-btn reddit"})
        linkedin_icon = soup.findAll("a", {"class": "share-btn linkedin"})
        email_icon = soup.findAll("a", {"class": "share-btn email"})
        self.assertIsNotNone(twitter_icon[0])
        self.assertIsNotNone(google_icon[0])
        self.assertIsNotNone(facebook_icon[0])
        self.assertIsNotNone(stumble_icon[0])
        self.assertIsNotNone(reddit_icon[0])
        self.assertIsNotNone(linkedin_icon[0])
        self.assertIsNotNone(email_icon[0])
