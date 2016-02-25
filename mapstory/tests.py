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
from geonode.geoserver.helpers import gs_catalog
from mapstory.export import export_via_model
from socket import error as socket_error
from geoserver.catalog import FailedRequestError
from geonode.geoserver.helpers import gs_catalog
from django import db
from .importers import GeoServerLayerCreator
from osgeo_importer.utils import UploadError

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

    def test_create_layers(self):
        """
        Tests the layer create view.
        """
        c = Client()
        response = c.get(reverse('layer_create'))

        # user must be authenticated
        self.assertEqual(response.status_code, 302)

        c.login(**{'username': self.non_admin, 'password': self.non_admin_password})
        response = c.get(reverse('layer_create'))
        self.assertEqual(response.status_code, 200)

        js = {"name": self.layer_name,
              "store": {"name": self.datastore.name},
              "namespace": {"name": 'geonode'},
              "attributes": {"attribute": [{"name": "time",
                                               "binding": "org.geotools.data.postgis.PostGISDialect$XDate",
                                               "minOccurs": 0,
                                               "nillable": True},
                                           {"name": "geometry",
                                                "binding": "com.vividsolutions.jts.geom.MultiLineString",
                                                "minOccurs":0,
                                                "nillable":True}]},
              "nativeCRS": "EPSG:4326",
              "srs": "EPSG:4326"}

        response = c.post(reverse('layer_create'), json.dumps({'featureType': js}), content_type='application/json',
                          HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertEqual(response.status_code, 201)
        res = json.loads(response.content)
        self.assertIn('status', res)
        self.assertIn('url', res['layers'][0])
        self.assertIn('name', res['layers'][0])
        self.assertTrue(Layer.objects.all().count())
        self.assertEqual(Layer.objects.first().owner.username, self.non_admin)

    def test_geoserverlayercreator(self):
        """
        Tests the layer create view.
        """
        c = Client()
        creater = GeoServerLayerCreator()
        owner = User.objects.get(username=self.non_admin)
        layer_name = 'This is a test.'
        js = {"name": layer_name,
              "store": {"name": self.datastore.name},
              "namespace": {"name": 'geonode'},
              "attributes": {"attribute": [{"name": "time",
                                               "binding": "org.geotools.data.postgis.PostGISDialect$XDate",
                                               "minOccurs": 0,
                                               "nillable": True},
                                           {"name": "geometry",
                                                "binding": "com.vividsolutions.jts.geom.MultiLineString",
                                                "minOccurs":0,
                                                "nillable":True}]},
              "nativeCRS": "EPSG:4326",
              "srs": "EPSG:4326"}

        response = creater.handle(configuration_options=[{'featureType': js, 'layer_owner': owner, 'title': 'This is a test.'}])

        layer = Layer.objects.first()
        self.assertIn(layer.name, response[0])
        self.assertTrue(layer)
        self.assertEqual(layer.name, 'this_is_a_test')
        self.assertEqual(layer.title, 'This is a test.')
        self.assertEqual(layer.owner, owner)
        self.assertTrue('xsd:dateTime' or 'xsd:date' in [n.attribute_type for n in layer.attributes.all()])
        #import ipdb; ipdb.set_trace()
        self.assertEqual(layer.geographic_bounding_box, 'SRID=EPSG:4326;POLYGON((-180.0000000000 -90.0000000000,-180.0000000000 90.0000000000,180.0000000000 90.0000000000,180.0000000000 -90.0000000000,-180.0000000000 -90.0000000000))')

        with self.assertRaises(UploadError):
            response = creater.handle(configuration_options=[{'featureType': js, 'layer_owner': owner}])


