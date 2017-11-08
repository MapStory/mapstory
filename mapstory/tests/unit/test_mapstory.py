from unittest import skip
from account.models import EmailConfirmation
from bs4 import BeautifulSoup

from django.core.urlresolvers import reverse
from django.core import mail
from django.contrib.auth import get_user_model, authenticate
from django.test import TestCase, Client
from django.test.utils import override_settings

from mapstory.mapstories.models import Map
from mapstory.mapstories.models import MapStory

from ..AdminClient import AdminClient
from ...version import get_version
from ... import __version__ as version
from ..MapStoryTestMixin import MapStoryTestMixin
from ..utils import get_test_user, create_mapstory
from ...forms import KeywordsForm, PublishStatusForm

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
        self.assertIsInstance(self.mapstory, MapStory, "Should be instance of MapStory")
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
        self.assertEqual(saved_mapstory.title, "Test story", "Should have the same title")
        self.assertEqual(saved_mapstory.owner, self.mapstory.owner, "Should have the same owner")

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
        test_mapstory = create_mapstory(testUser, 'Testing Map 01')
        self.assertIsNotNone(test_mapstory)
        self.assertIsNotNone(test_mapstory.id)

        # Should exist in the database
        found = MapStory.objects.get(id=test_mapstory.id)
        self.assertEquals(found.title, test_mapstory.title)
        self.client.login(username=testUser.username, password="admin")
        # Should get a 200 response from the URL
        response = self.client.get(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
        self.assertEquals(response.status_code, 200)

        # Should use the correct template
        self.assertTemplateUsed(response, 'maps/map_detail.html')
        self.assertContains(response, test_mapstory.title)

    def test_post_mapstory_detail_keyword_post(self):
        # Should create add a keyword
        test_mapstory = create_mapstory(testUser, 'Testing Map 02')
        self.client.login(username=testUser.username, password="admin")
        response = self.client.post(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}), {'add_keyword': 'test_keyword'})
        self.assertEquals(response.status_code, 200)

        # Should remove the keyword
        response = self.client.post(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}),
                                    {'remove_keyword': 'test_keyword'})

        self.assertEquals(response.status_code, 200)

        # Should handle Keywords form post
        form_data = {'keywords': ['testKeyword01','testKeyword02','testKeyword03']}
        form = KeywordsForm(data=form_data)
        self.assertTrue(form.is_valid())
        response = self.client.post(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}), form_data)
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
        response = self.client.get(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
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
        self.assertEqual(title[0]['content'].encode('utf-8'), test_mapstory.title)
        self.assertTrue(test_mapstory.abstract in description[0]['content'].encode('utf-8'))
        self.assertIsNotNone(image[0]['content'].encode('utf-8'))
        self.assertEqual(site[0]['content'].encode('utf-8'), "@mapstory")

    def test_mapstory_details_share_buttons(self):
        test_mapstory = create_mapstory(testUser, 'Testing Map 05')
        self.assertIsNotNone(test_mapstory)
        self.assertIsNotNone(test_mapstory.id)

        # Should get a 200 response from the URL
        self.client.login(username=testUser.username, password="admin")
        response = self.client.get(reverse('mapstory_detail', kwargs={"slug": test_mapstory.slug}))
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


class TestMapstoryIntegrations(TestCase):
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
        test_map = Map()
        self.assertIsInstance(test_map, Map)


class MapStoryTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

    @override_settings(GOOGLE_ANALYTICS=True)
    def test_google_analytics(self):
        """
        Tests to make sure our Google Analytics code is in the source.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue("UA-70972031-1" in response.content)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_home_renders(self):
        """
        Ensure the home page returns a 200 and contains the expected sections.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)
        # Assert that we have the different sections
        # Use the soup:
        soup = BeautifulSoup(response.content, 'html.parser')
        self.assertIsNotNone(soup)
        self.assertEquals(soup.title.string, u'MapStory')
        # Our homepage should have 8 sections
        # Map section
        self.assertEqual(len(soup.find_all('section', class_='splash')), 1)
        # Featured MapStories
        self.assertEqual(len(soup.find_all('section', class_='featured-cards')), 1)
        # How section
        self.assertEqual(len(soup.find_all('section', class_='how-homepage')), 1)
        # Contribute section
        self.assertEqual(len(soup.find_all('section', class_='contribute-commons')), 1)
        # Share
        self.assertEqual(len(soup.find_all('section', class_='share-expertise')), 1)
        # To Life
        self.assertEqual(len(soup.find_all('section', class_='to-life')), 1)
        # More
        self.assertEqual(len(soup.find_all('section', class_='more-you-know')), 1)
        # Sponsors
        self.assertEqual(len(soup.find_all('section', class_='sponsors')), 1)
        # Should have a footer
        self.assertEqual(len(soup.find_all('footer')), 1)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_search_renders(self):
        """
        Ensure the search page returns a 200.
        """
        c = Client()
        response = c.get(reverse('search'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_sign_up_renders(self):
        """
        Ensure the sign up page returns a 200.
        """
        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_new_map_renders(self):
        """
        The new_map named URL did not exist and this test was failing.
        TODO: Check if we are using new_map at all and possibly remove.
        """
        c = AdminClient()
        response = c.get(reverse('new_map'))
        # It has weird behavior for logins
        # self.assertLoginRequired(response)
        c.login_as_admin()
        response = c.get(reverse('new_map'), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_new_map_json_renders(self):
        """
        Ensure the new map json returns a 200.
        """
        c = AdminClient()
        response = c.get(reverse('new_map_json'))
        self.assertLoginRequired(response)
        c.login_as_admin()
        response = c.get(reverse('new_map_json'))
        self.assertEqual(response.status_code, 200)

    @skip("TODO")
    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_story_teller_renders(self):
        """
        Ensure the story teller view renders.
        """
        c = AdminClient()
        response = c.get(reverse('profile_detail', args=['nope']))
        self.assertEqual(response.status_code, 404)

        response = c.get(reverse('storyteller_detail', args=['admin']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        response = c.get(reverse('profile_detail', args=['admin']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        # make sure user cannot delete if not logged in
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertLoginRequired(response)

        # delete someone else's profile should result in 403 response forbidden
        c.login_as_non_admin()
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertEqual(response.status_code, 403)

        c.login_as_admin()
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_about_leaders_page_renders(self):
        """
        Ensure the about leaders page view renders.
        """
        c = Client()
        response = c.get(reverse('about-leaders'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_donate_renders(self):
        """
        Ensure the donate view renders.
        """
        c = Client()
        response = c.get(reverse('donate'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_get_started_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['started']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_get_involved_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['involved']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_get_skills_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['skills']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_sign_in_renders(self):
        """
        Ensure the sign in renders.
        """
        c = Client()
        response = c.get(reverse('account_login'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        response = c.post(reverse('account_login'), data={'username': self.non_admin_username,
                                                          'password': self.non_admin_password})
        self.assertEqual(response.status_code, 302)
        c.logout()

        response = c.post(reverse('account_login'), data={'username': 'nope',
                                                          'password': 'nope'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['form'].errors['__all__'][0],
                         'The username and/or password you specified are not correct.')

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_sign_up(self):
        """
        Ensure the signup works.
        """

        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        data = dict(username='test', name_long='test', first_name='test12345', last_name='user', email='test@example.com', password='test',
                    password_confirm='test')

        response = c.post(reverse('account_signup'), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertHasGoogleAnalytics(response)

        # make sure the custom subject template is being used
        self.assertEqual(mail.outbox[0].subject, 'Account activation on MapStory')
        conf = EmailConfirmation.objects.first()
        self.assertTrue(conf.key in mail.outbox[0].body)

        response = c.get(reverse('account_confirm_email', args=[conf.key]))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        user = authenticate(**data)
        self.assertTrue(user)
        self.assertEqual(user.username, data['username'])
        self.assertEqual(user.name_long, data['first_name'] + ' ' + data['last_name'] + ' (' + data['username'] + ')')
        self.assertEqual(user.first_name, data['first_name'])
        self.assertEqual(user.last_name, data['last_name'])
        self.assertEqual(user.email, data['email'])

        response = c.post(reverse('account_confirm_email', args=[conf.key]))
        self.assertEqual(response.status_code, 302)
        # self.assertEqual(len(mail.outbox), 2) - @TODO Fix the mailbox assertion.
        # self.assertHasGoogleAnalytics(response) - @TODO This is returning False for some reason

        # make sure the custom subject and welcome template is being used
        self.assertEqual(mail.outbox[1].subject, "Welcome to MapStory!")
        # Regardless of email content used, ensure it personally addresses the user
        self.assertTrue(user.username in mail.outbox[1].body or user.first_name in mail.outbox[1].body)


class ExtraMapstoryTests(MapStoryTestMixin):
    def setUp(self):
        pass

    def test_home(self):
        c = Client()
        response = c.get(reverse('index_view'))

        self.assertEqual(reverse('index_view'), u'/', 'Named url "index_view" should resolve to "/"')
        self.assertEqual(response.template_name[0], 'index.html', 'Home should be using index.html template')

    def test_create_new_mapStory(self):
        user = User.objects.create_user(username='john',
                                        email='jlennon@beatles.com',
                                        password='glassonion')
        mapstory = MapStory()
        self.assertIsInstance(mapstory, MapStory)
        mapstory.title = "Test story"
        mapstory.owner = user
        mapstory.save()
