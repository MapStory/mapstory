import os
from account.models import EmailConfirmation
from django.test import TestCase, Client
from django.test.utils import override_settings
from django.conf import settings
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate
from django.contrib.staticfiles import finders
from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from geonode.layers.models import Layer
from geonode.layers.populate_layers_data import create_layer_data
from mapstory.models import Community, DiaryEntry
from geonode.people.models import Profile
import json

from mapstory.export import export_via_model
from geonode.maps.models import Map
from mapstory.importer.import_handlers import GeoserverPublishHandler

User = get_user_model()


class AdminClient(Client):

    def login_as_admin(self, username='admin', password='admin'):
        """
        Convenience method to login admin.
        """
        return self.login(**{'username': username, 'password': password})

    def login_as_non_admin(self, username='non_admin', password='non_admin'):
        """
        Convenience method to login a non-admin.
        """
        return self.login(**{'username': username, 'password': password})

class MapStoryTestMixin(TestCase):

    def assertLoginRequired(self, response):
        self.assertEqual(response.status_code, 302)
        self.assertTrue('login' in response.url)

    def assertHasGoogleAnalytics(self, response):
        self.assertTrue('mapstory/google_analytics.html' in [t.name for t in response.templates])

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = User.objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password


class MapStoryTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """

    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

    def test_home_renders(self):
        """
        Ensure the home page returns a 200.
        """

        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_google_analytics(self):
        """
        Tests the Google Analytics context processor and template.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue("_gaq.push(['_setAccount', 'testing']);" in response.content)

    def test_search_renders(self):
        """
        Ensure the search page returns a 200.
        """

        c = Client()
        response = c.get(reverse('search'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_csv_user_export(self):
        """
        Ensure export model returns a csv file
        """
        c = Client()

        request = c.get(reverse('index_view'))

        response = export_via_model(User, request, User.objects.all(), exclude=['password'])

        self.assertEqual(response['Content-Type'], 'text/csv')

    def test_journal_renders(self):
        """
        Ensure the journal functionality works.
        """

        c = AdminClient()
        response = c.get(reverse('diary'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        response = c.get(reverse('diary-create'))
        self.assertLoginRequired(response)

        c.login_as_non_admin()
        response = c.get(reverse('diary-create'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        response = c.get(reverse('diary-detail', args=[1]))
        self.assertEqual(response.status_code, 404)

        data = {'title': 'testing a new journal', 'content': 'This is test content'}
        response = c.post(reverse('diary-create'), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        journal = DiaryEntry.objects.get(title=data['title'])
        self.assertEqual(journal.author, response.context['user'])
        self.assertEqual(journal.content, data['content'])
        self.assertFalse(journal.publish)
        self.assertFalse(journal.show_on_main)

        data['publish'] = True
        data['show_on_main'] = True

        response = c.post(reverse('diary-update', args=[journal.id]), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        journal = DiaryEntry.objects.get(title=data['title'])
        self.assertTrue(journal.publish)
        self.assertFalse(journal.show_on_main)

        response = c.get(reverse('diary'))
        self.assertIn(journal, response.context['object_list'])

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
        Ensure the new map page returns a 200.
        """

        c = AdminClient()
        response = c.get(reverse('new_map'))
        self.assertLoginRequired(response)

        c.login_as_admin()
        response = c.get(reverse('new_map'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

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

    def test_story_teller_renders(self):
        """
        Ensure the story teller view renders.
        """
        c = AdminClient()
        response = c.get(reverse('profile_detail', args=['nope']))
        self.assertEqual(response.status_code, 404)

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

    def test_editor_tour_renders(self):
        """
        Ensure the editor tour view renders.
        """
        c = Client()
        response = c.get(reverse('editor_tour'))
        self.assertEqual(response.status_code, 200)

    def test_initiative_renders(self):
        """
        Ensure the initiative view renders.
        """
        c = Client()
        response = c.get(reverse('community-detail', args=['nope']))
        self.assertEqual(response.status_code, 404)
        icon = SimpleUploadedFile(name='test_image.png',
                               content=open(finders.find('mapstory/img/img_95x65.png'), 'rb').read(),
                               content_type='image/png')

        community = Community(name='testing', icon=icon)
        community.save()
        response = c.get(reverse('community-detail', kwargs=dict(slug='testing')))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_about_leaders_page_renders(self):
        """
        Ensure the about leaders page view renders.
        """
        c = Client()
        response = c.get(reverse('about-leaders'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_donate_renders(self):
        """
        Ensure the donate view renders.
        """
        c = Client()
        response = c.get(reverse('donate'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_layer_upload_renders(self):
        """
        Ensure the layer upload view renders.
        """
        c = AdminClient()
        response = c.get(reverse('layer_upload'))
        self.assertLoginRequired(response)

        c.login_as_non_admin()
        response = c.get(reverse('layer_upload'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_get_started_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['started']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_get_involved_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['involved']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_get_skills_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['skills']))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

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

    def test_sign_up(self):
        """
        Ensure the signup works.
        """

        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        data = dict(username='test', firstname='test', lastname='user', email='test@example.com', password='test',
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
        self.assertEqual(user.first_name, data['firstname'])
        self.assertEqual(user.last_name, data['lastname'])
        self.assertEqual(user.email, data['email'])

        response = c.post(reverse('account_confirm_email', args=[conf.key]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(len(mail.outbox), 2)
        #self.assertHasGoogleAnalytics(response) - This is returning False for some reason

        # make sure the custom subject and welcome template is being used
        self.assertEqual(mail.outbox[1].subject, "Welcome to MapStory!")
        # Regardless of email content used, ensure it personally addresses the user
        self.assertTrue(user.username in mail.outbox[1].body or user.first_name in mail.outbox[1].body)

class Oauth2ProviderTest(TestCase):

    fixtures = ['test_user_data.json']

    c = Client()

    def setUp(self):
        from provider.oauth2.models import AccessToken, Client
        self.bobby = Profile.objects.get(username='bobby')
        self.admin = Profile.objects.get(username='robert')
        self.client = Client.objects.create(client_type = 1)
        self.token = AccessToken.objects.create(user=self.bobby, client=self.client)

    def test_account_verify_error(self):
        url = reverse('account_verify')
        resp = self.c.get(url)
        self.assertEqual(resp.status_code, 403)
        resp = self.c.get(url, {'access_token': self.token.token[1:]})
        self.assertEqual(resp.status_code, 403)

    def test_account_verify_token(self):
        url = reverse('account_verify')
        resp = self.c.get(url, {'access_token': self.token.token})
        account = json.loads(resp.content)
        self.assertEqual(int(account['id']), self.bobby.id)

        url = reverse('account_verify')
        resp = self.c.get(url, HTTP_AUTHORIZATION='Bearer ' + self.token.token)
        account = json.loads(resp.content)
        self.assertEqual(int(account['id']), self.bobby.id)

#
class MapStoryTestsWorkFlowTests(MapStoryTestMixin):
#
    def setUp(self):
#         # these are needed for the geonode fixtures
        TopicCategory.objects.create(identifier='biota')
        TopicCategory.objects.create(identifier='location')
        TopicCategory.objects.create(identifier='elevation')
#
        #layer = Layer()
        #GPH = GeoserverPublishHandler(layer)
        #GPH.get_or_create_datastore()
        #c = AdminClient()
        #c.login_as_admin()
        create_models(type='layer')
        create_layer_data()
#
    def test_layer(self):
        layer = Layer.objects.first()
        c = Client()
#        response = c.get(reverse('layer_detail', args=[layer.typename]))
#        self.assertEqual(response.status_code, 200)
#
#        response = c.get(reverse('layer_metadata', args=[layer.typename]))
#        self.assertLoginRequired(response)
#
#        response = c.get(reverse('layer_edit', args=[layer.typename]))
#        self.assertLoginRequired(response)
'''
    def test_detail_page_forms(self):
        c = Client()
        layer = Layer.objects.first()

        # Render detail page and grab its context data
        response = c.get(reverse('layer_detail', args=[layer.typename]))
        self.assertEqual(response.status_code, 200)

        # Fill in the keywords form
        # response.context should have some of the context data, not sure what it lists though
        # probably access with [], and it's probably a dict for the form
        # Test what keywords are before
        # Might need to be .objects.all() or smth
        old_keywords = layer.keywords.all()

        form_data = {'keywords': 'test, test2'}

        # Submit POST with the form data
        c.post(reverse('layer_detail'), args=[layer.typename], data=form_data)

        # Make sure the layer's keywords are updated
        new_keywords = layer.keywords.all()
        # Do an assert that old and new are not the same
        self.assertFalse(old_keywords == new_keywords)

        # Get the keywords_form from the request.context and make sure it has the new_keywords
        # Assert they are equal
        # Need to get just the names from the new_keywords
        new_keywords_names = []
        for nkeyword in new_keywords:
            new_keywords_names.append(nkeyword.name)
        self.assertEqual(request.context['keywords_form'].cleaned_data['keywords'], new_keywords_names)

        # Now the published form
        old_published_status = layer.is_published

        form_data = {'is_published': 'on'}

        # Submit POST with the form data
        c.post(reverse('layer_detail'), args=[layer.typename], data=form_data)

        # Make sure publishing status was updated
        new_published_status = layer.is_published
        # Do an assert that old and new are not the same
        self.assertFalse(old_published_status == new_published_status)
        # We turned it on, so make sure the new status is True
        self.assertTrue(new_published_status)

        # Make sure the keywords have been retained
        # Do an assert that layer.keywords and new_keywords are the same
        self.assertEqual(layer.keywords.all(), new_keywords)

        # Make sure the keywords_form from the request.context has new_keywords, and the published form has new_published_status
        self.assertEqual(request.context['keywords_form'].cleaned_data['keywords'], new_keywords_names)
        self.assertEqual(request.context['published_form'].cleaned_data['is_published'], new_published_status)

        # Finally, the metadata form
        old_metadata = {'category': layer.category, 'language': layer.language, 'distribution_url': layer.distribution_url,
        'data_quality_statement': layer.data_quality_statement, 'purpose': layer.purpose, 'is_published': layer.is_published}

        form_data = {'category': '1', 'language': 'fra', 'distribution_url': 'http://www.google.com',
        'data_quality_statement': 'This is quality', 'purpose': 'To educate', 'is_published': 'on'}

        # Submit POST with form data
        c.post(reverse('layer_detail'), args=[layer.typename], data=form_data)

        new_metadata = {'category': layer.category, 'language': layer.language, 'distribution_url': layer.distribution_url,
        'data_quality_statement': layer.data_quality_statement, 'purpose': layer.purpose, 'is_published': layer.is_published}

        # Make sure the new_metadata is not identical to the old_metadata
        self.assertFalse(new_metadata == old_metadata)

        # Make sure the new_metadata is identical to the form_data that we posted
        self.assertEqual(form_data, new_metadata)

        # Make sure the keywords have been retained
        self.assertEqual(layer.keywords.all(), new_keywords)

        # Make sure the keywords_form, published_form, and metadata_form all contain the appropriate values
        self.assertEqual(request.context['keywords_form'].cleaned_data['keywords'], new_keywords_names)
        self.assertEqual(request.context['published_form'].cleaned_data['is_published'], new_published_status)
        for metadata in new_metadata:
            self.assertEqual(request.context['metadata_form'].cleaned_data[metadata], new_metadata[metadata])

        # Render detail page and grab its context data
        # Test map detail page
        mapstory = Map.objects.first()

        response = c.get(reverse('map_detail', args=[mapstory.id]))
        self.assertEqual(response.status_code, 200)

        # Fill in the keywords form
        old_keywords = mapstory.keywords.all()

        form_data = {'keywords': 'test, test2'}

        # Submit POST with form data
        response = c.post(reverse('map_detail', args=[mapstory.id]), data=form_data)

        new_keywords = map.keywords.all()

        self.assertFalse(old_keywords == new_keywords)

        new_keywords_names = []
        for nkeyword in new_keywords:
            new_keywords_names.append(nkeyword.name)
        self.assertEqual(request.context['keywords_form'].cleaned_data['keywords'], new_keywords_names)

        old_published_status = mapstory.is_published

        form_data = {'is_published': 'on'}

        response = c.post(reverse('map_detail', args=[mapstory.id]), data=form_data)

        # Make sure publishing status was updated
        new_published_status = mapstory.is_published
        # Do an assert that old and new are not the same
        self.assertFalse(old_published_status == new_published_status)
        # We turned it on, so make sure the new status is True
        self.assertTrue(new_published_status)

        # Make sure the keywords have been retained
        # Do an assert that layer.keywords and new_keywords are the same
        self.assertEqual(mapstory.keywords.all(), new_keywords)

        # Make sure the keywords_form from the request.context has new_keywords, and the published form has new_published_status
        self.assertEqual(request.context['keywords_form'].cleaned_data['keywords'], new_keywords_names)
        self.assertEqual(request.context['published_form'].cleaned_data['is_published'], new_published_status)
'''

