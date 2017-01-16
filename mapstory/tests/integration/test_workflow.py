
import os
from datetime import datetime
from socket import error as socket_error

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.db import connection
from django.test import Client
from django.test.utils import override_settings

from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from geonode.contrib.collections.models import Collection
from geonode.geoserver.helpers import gs_catalog
from geonode.groups.models import GroupProfile
from geonode.layers.models import Layer

from ..AdminClient import AdminClient
from ..MapStoryTestMixin import MapStoryTestMixin

User = get_user_model()

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
            print(e.__dict__)

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
        
        cursor = connection.cursor()

        def geonode_authorize_layer(username, typename):
            cursor.execute("select geonode_authorize_layer(%s, %s)", [username, typename])
            return cursor.fetchone()[0]

        # Create the authorize layer function
        with open(authorize_layer, 'rb') as sql:
            cursor.execute(sql.read())

        self.assertEqual(geonode_authorize_layer('admin', layer.typename), 'su-rw')
        self.assertEqual(geonode_authorize_layer('user1', layer.typename), 'lo-rw')

        #anon = User.objects.get(username='AnonymousUser')
        perms = layer.get_all_level_info()
        perms['users']['AnonymousUser'] = ['change_layer_data']
        layer.set_permissions(perms)
        print layer.get_all_level_info()
        self.assertEqual(geonode_authorize_layer('AnonymousUser', layer.typename), 'lo-rw')

    def test_detail_page_forms(self):
        c = AdminClient()
        c.login_as_admin()
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
        'distribution_url': unicode(layer.distribution_url), 'data_quality_statement': unicode('This is quality'),
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

    @override_settings(GOOGLE_ANALYTICS='testing')
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

    @override_settings(GOOGLE_ANALYTICS='testing')
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
