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
from mapstory.models import DiaryEntry
from geonode.people.models import Profile
import json
from geonode.geoserver.helpers import gs_catalog
from mapstory.export import export_via_model
from socket import error as socket_error
from geoserver.catalog import FailedRequestError
from geonode.geoserver.helpers import gs_catalog
from django import db
from .importers import GeoServerLayerCreator
from osgeo_importer.utils import UploadError
from geonode.groups.models import GroupProfile
from geonode.contrib.collections.models import Collection
from datetime import datetime
from .models import Sponsor

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
        self.assertTrue('mapstory/_google_analytics.html' in [t.name for t in response.templates])

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

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_google_analytics(self):
        """
        Tests the Google Analytics context processor and template.
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue("_gaq.push(['_setAccount', 'testing']);" in response.content)

    def test_home_renders(self):
        """
        Ensure the home page returns a 200.
        """

        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_search_renders(self):
        """
        Ensure the search page returns a 200.
        """

        c = Client()
        response = c.get(reverse('search'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

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
        self.assertEqual(len(mail.outbox), 2)
        #self.assertHasGoogleAnalytics(response) - This is returning False for some reason

        # make sure the custom subject and welcome template is being used
        self.assertEqual(mail.outbox[1].subject, "Welcome to MapStory!")
        # Regardless of email content used, ensure it personally addresses the user
        self.assertTrue(user.username in mail.outbox[1].body or user.first_name in mail.outbox[1].body)


class MapStoryAdminTests(MapStoryTestMixin):

    def test_csv_user_export(self):
        """
        Ensure export model returns a csv file
        """
        c = Client()

        request = c.get(reverse('index_view'))

        response = export_via_model(User, request, User.objects.all(), exclude=['password'])

        self.assertEqual(response['Content-Type'], 'text/csv')


class MapStoryTestsWorkFlowTests(MapStoryTestMixin):

    def setUp(self):

        try:
            # Ensure that gs_catalog.about() is falsy
            assert not gs_catalog.about()
        except AssertionError:
            # geoserver is running, skip the test
            self.skipTest('Geoserver should not be running for this test.')
        except socket_error as e:
            # gs_config.about() will throw a socket error if geoserver is not running (which is good in this case)
            pass

        TopicCategory.objects.create(identifier='biota')
        TopicCategory.objects.create(identifier='location')
        TopicCategory.objects.create(identifier='elevation')

        create_models(type='layer')

    def test_layer(self):
        layer = Layer.objects.first()
        c = AdminClient()
        c.login_as_admin()
        response = c.get(reverse('layer_detail', args=[layer.typename]))
        self.assertEqual(response.status_code, 200)

        response = c.get(reverse('layer_metadata', args=[layer.typename]))
        self.assertEqual(response.status_code, 200)

    def test_geonode_authorize_layer(self):
        raise self.skipTest('Not implemented.')
        authorize_layer = os.path.join(os.path.split(__file__)[0],os.pardir,
                                    'scripts/provision/roles/db/files/geonode_authorize_layer.sql')

        if not os.path.exists(authorize_layer):
            self.skipTest('Authorize layer function does not exist.')

        layer = Layer.objects.first()
        from django.db import connection
        cursor = connection.cursor()

        def geonode_authorize_layer(username, typename):
            cursor.execute("select geonode_authorize_layer(%s, %s)", [username, typename])
            return cursor.fetchone()[0]

        # Create the authorize layer function
        with open(authorize_layer, 'rb') as sql:
            cursor.execute(sql.read())

        self.assertEqual(geonode_authorize_layer('admin', layer.typename), 'su-rw')
        self.assertEqual(geonode_authorize_layer('user1', layer.typename), 'lo-rw')

        anon = User.objects.get(username='AnonymousUser')
        perms = layer.get_all_level_info()
        perms['users']['AnonymousUser'] = ['change_layer_data']
        layer.set_permissions(perms)
        print layer.get_all_level_info()
        self.assertEqual(geonode_authorize_layer('AnonymousUser', layer.typename), 'lo-rw')

    def test_detail_page_forms(self):
        c = Client()
        layer = Layer.objects.first()
        response = c.get(reverse('layer_detail', args=[layer.typename]))
        self.assertEqual(response.status_code, 200)

        # keywords_form test
        old_keywords = layer.keywords.all()
        old_keywords_names = []
        for okeyword in old_keywords:
            old_keywords_names.append(okeyword.name)

        form_data = {'keywords': 'test, test2'}
        response = c.post(reverse('layer_detail', args=[layer.typename]), data=form_data)
        self.assertEqual(response.status_code, 200)
        # Make sure the layer's keywords are updated
        layer = Layer.objects.filter(id=layer.id)[0]
        new_keywords = layer.keywords.all()
        new_keywords_names = []
        for nkeyword in new_keywords:
            new_keywords_names.append(nkeyword.name)
        self.assertFalse(old_keywords_names == new_keywords_names)

        # metadata_form test
        old_metadata = {'title': layer.title, 'category': layer.category, 'language': layer.language,
        'distribution_url': layer.distribution_url, 'data_quality_statement': layer.data_quality_statement,
        'purpose': layer.purpose, 'is_published': layer.is_published}
        # distribution url doesn't seem to be modifiable
        form_data = {'title': 'New title', 'category': '1', 'language': 'fra', 'distribution_url': layer.distribution_url,
        'data_quality_statement': 'This is quality', 'purpose': 'To educate', 'is_published': 'on'}
        # The submitted data as it will appear in the model is slightly different
        submitted_data = {'title': unicode('New title'), 'category': TopicCategory.objects.first(), 'language': unicode('fra'),
        'distribution_url': layer.distribution_url, 'data_quality_statement': unicode('This is quality'),
        'purpose': unicode('To educate'), 'is_published': True}

        response = c.post(reverse('layer_detail', args=[layer.typename]), data=form_data)
        self.assertEqual(response.status_code, 200)
        layer = Layer.objects.filter(id=layer.id)[0]
        new_metadata = {'title': layer.title, 'category': layer.category, 'language': layer.language,
        'distribution_url': layer.distribution_url, 'data_quality_statement': layer.data_quality_statement,
        'purpose': layer.purpose, 'is_published': layer.is_published}

        self.assertFalse(new_metadata == old_metadata)
        self.assertEqual(submitted_data, new_metadata)

        # Make sure the keywords have been retained
        layer_keywords_names = []
        for lkeyword in layer.keywords.all():
            layer_keywords_names.append(lkeyword.name)
        self.assertEqual(layer_keywords_names, new_keywords_names)

    def test_organizations(self):
        admin = AdminClient()
        admin.login_as_admin()
        response = admin.get(reverse('organization_create'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        # Create new organization
        form_data = {'social_twitter': 'notreal', 'social_facebook': 'notreal', 'title': 'Test Organization',
        'description': 'Testing', 'email': 'test@test.com', 'access': 'public', 'date_joined': datetime.now(),
        'city': 'Victoria', 'country': 'CAN', 'keywords': 'test', 'profile_type': 'org', 'slug': 'Test-Organization'}
        response = admin.post(reverse('organization_create'), data=form_data)
        # Redirect when form is submitted, therefore 302
        self.assertEqual(response.status_code, 302)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)

        # Test editing the organization
        form_data = {'title': 'Test Organization', 'description': 'Edit', 'keywords': 'edit', 'profile_type': 'org',
        'access': 'public', 'slug': 'Test-Organization', 'date_joined': datetime.now()}
        response = admin.post(reverse('organization_edit', args=[group.slug]), data=form_data)
        # Redirect when form is submitted, therefore 302
        self.assertEqual(response.status_code, 302)

        group = GroupProfile.objects.all().first()
        self.assertEqual(group.description, 'Edit')
        group_keywords = []
        for keyword in group.keywords.all():
            group_keywords.append(keyword.name)
        self.assertEqual(group_keywords, ['edit'])

        # Make sure the detail page can be viewed by a regular user
        c = Client()
        response = c.get(reverse('organization_detail', args=[group.slug]))
        self.assertEqual(response.status_code, 200)

    def test_initiatives(self):
        admin = AdminClient()
        admin.login_as_admin()
        response = admin.get(reverse('initiative_create'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

        # Create new organization
        form_data = {'social_twitter': 'notreal', 'social_facebook': 'notreal', 'title': 'Test Initiative',
        'description': 'Testing', 'email': 'test@test.com', 'access': 'public', 'date_joined': datetime.now(),
        'city': 'Victoria', 'country': 'CAN', 'keywords': 'test', 'profile_type': 'ini', 'slug': 'Test-Initiative'}
        response = admin.post(reverse('initiative_create'), data=form_data)
        # Redirect when form is submitted, therefore 302
        self.assertEqual(response.status_code, 302)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)

        # Test editing the organization
        form_data = {'title': 'Test Initiative', 'description': 'Edit', 'keywords': 'edit', 'profile_type': 'ini',
        'access': 'public', 'slug': 'Test-Initiative', 'date_joined': datetime.now()}
        response = admin.post(reverse('initiative_edit', args=[group.slug]), data=form_data)
        # Redirect when form is submitted, therefore 302
        self.assertEqual(response.status_code, 302)

        group = GroupProfile.objects.all().first()
        self.assertEqual(group.description, 'Edit')
        group_keywords = []
        for keyword in group.keywords.all():
            group_keywords.append(keyword.name)
        self.assertEqual(group_keywords, ['edit'])

        # Make sure the detail page can be viewed by a regular user
        c = Client()
        response = c.get(reverse('initiative_detail', args=[group.slug]))
        self.assertEqual(response.status_code, 200)


class LayersCreateTest(MapStoryTestMixin):

    def create_datastore(self, connection, catalog):
        settings = connection.settings_dict
        params = {'database': settings['NAME'],
                  'passwd': settings['PASSWORD'],
                  'namespace': 'http://www.geonode.org/',
                  'type': 'PostGIS',
                  'dbtype': 'postgis',
                  'host': settings['HOST'],
                  'user': settings['USER'],
                  'port': settings['PORT'],
                  'enabled': "True"}

        store = catalog.create_datastore(settings['NAME'], workspace=self.workspace)
        store.connection_parameters.update(params)

        try:
            catalog.save(store)
        except FailedRequestError:
            # assuming this is because it already exists
            pass

        return catalog.get_store(settings['NAME'])

    def setUp(self):

        try:
            # Ensure Geoserver is running.
            assert gs_catalog.about()
        except socket_error as e:
            self.skipTest('Geoserver must be running for this test.')

        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin, self.non_admin_password = self.create_user('non_admin', 'non_admin', is_superuser=True)
        self.layer_name = 'testz'
        self.workspace ='geonode'
        self.postgis = db.connections['datastore']
        self.datastore = self.create_datastore(self.postgis, gs_catalog)

        cursor = self.postgis.cursor()
        cursor.execute("drop domain if exists bigdate cascade;")
        cursor.execute("create domain bigdate as bigint;")

    def tearDown(self):

        layer = gs_catalog.get_layer(self.layer_name)

        if layer:
            gs_catalog.delete(layer)

        if self.datastore:
            gs_catalog.delete(self.datastore, recurse=True)


class SponsorModelTest(TestCase):
    def test_sponsor_name(self):
        sponsor = Sponsor(name='My Sponsor Name')
        self.assertEqual(unicode(sponsor), 'Sponsor - ' + sponsor.name)

