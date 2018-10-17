from unittest import skip

from django.contrib.auth import authenticate, get_user_model
from django.core import mail
from django.core.urlresolvers import reverse
from django.test import Client
from django.test.utils import override_settings

from bs4 import BeautifulSoup

from ... import __version__ as version
from ...forms import KeywordsForm, PublishStatusForm
from ...version import get_version
from ..AdminClient import AdminClient
from ..MapStoryTestMixin import MapStoryTestMixin
from ..utils import create_mapstory, get_test_user


class MapStoryTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """

    def setUp(self):
        self.username, self.password = self.create_user(
            'admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user(
            'non_admin', 'non_admin')

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
        self.assertEqual(
            len(soup.find_all('section', class_='featured-cards')), 1)
        # How section
        self.assertEqual(
            len(soup.find_all('section', class_='how-homepage')), 1)
        # Contribute section
        self.assertEqual(
            len(soup.find_all('section', class_='contribute-commons')), 1)
        # Share
        self.assertEqual(
            len(soup.find_all('section', class_='share-expertise')), 1)
        # To Life
        self.assertEqual(len(soup.find_all('section', class_='to-life')), 1)
        # More
        self.assertEqual(
            len(soup.find_all('section', class_='more-you-know')), 1)
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

        response = c.post(reverse('account_login'), data={'login': self.non_admin_username,
                                                          'password': self.non_admin_password})
        self.assertEqual(response.status_code, 302)
        c.logout()

        response = c.post(reverse('account_login'), data={'login': 'nope',
                                                          'password': 'nope'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['form'].errors['__all__'][0],
                         'The username and/or password you specified are not correct.')
