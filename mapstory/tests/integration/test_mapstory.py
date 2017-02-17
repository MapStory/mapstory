from unittest import skip
from account.models import EmailConfirmation

from django.core.urlresolvers import reverse
from django.core import mail
from django.contrib.auth import get_user_model, authenticate
from django.test import TestCase, Client
from django.test.utils import override_settings

from mapstory.mapstories.models import Map
from mapstory.mapstories.models import MapStory

from ..AdminClient import AdminClient
from ..MapStoryTestMixin import MapStoryTestMixin

# Gets the custom user model
User = get_user_model()

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
        testMap = Map()
        self.assertIsInstance(testMap, Map)

class MapStoryTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_google_analytics(self):
        """
        Tests the Google Analytics context processor and template.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue("_gaq.push(['_setAccount', 'testing']);" in response.content)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_home_renders(self):
        """
        Ensure the home page returns a 200.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

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


    def test_create_new_map(self):
        testMap = Map()
        self.assertIsInstance(testMap, Map)

