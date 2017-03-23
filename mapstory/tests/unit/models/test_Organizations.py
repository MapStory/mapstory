from django.core.urlresolvers import reverse
from datetime import datetime
from bs4 import BeautifulSoup
from django.test import TestCase, Client
from mapstory.apps.collections.models import Collection
from geonode.groups.models import GroupProfile

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

class MapStoryOrganizationTests(MapStoryTestMixin):
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

        self.admin_client = AdminClient()
        self.admin_client.login_as_admin()

        self.form_data = {
            'social_twitter': 'notreal',
            'social_facebook': 'notreal',
            'title': 'Test Organization',
            'description': 'Testing',
            'email': 'test@test.com',
            'access': 'public',
            'date_joined': datetime.now(),
            'city': 'Victoria',
            'country': 'CAN',
            'keywords': 'test',
            'profile_type': 'org',
            'slug': 'Test-Organization'
        }

        response = self.admin_client.post(reverse('organization_create'), data=self.form_data, follow=True)
        # Test for final status code = HTTP OK
        self.assertEqual(response.status_code, 200)

        # Test for correct redirect
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/organizations/' + self.form_data['slug'], status_code=302, target_status_code=200)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)


    def test_organization_create(self):
        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)
        manager = group.get_managers().all()
        # Should only have 1 manager
        self.assertEqual(len(manager), 1)
        self.assertEqual(group.org.profile_type, 'org')

    def test_organization_create_get(self):
        """Should return an empty form.
        """
        response = self.admin_client.get(reverse('organization_create'), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_organization_create_post(self):
        """Should create a new organization
        """
        admin_client = AdminClient()
        admin_client.login_as_admin()

        # Create new organization
        form_data = {
            'social_twitter': 'notreal',
            'social_facebook': 'notreal',
            'title': 'Test Organization Two',
            'description': 'Testing',
            'email': 'test@test.com',
            'access': 'public',
            'date_joined': datetime.now(),
            'city': 'Cholula',
            'country': 'MEX',
            'keywords': 'test',
            'profile_type': 'org',
            'slug': 'Test-Organization-Two'
        }

        response = admin_client.post(reverse('organization_create'), data=form_data, follow=True)
        self.assertEqual(response.status_code, 200)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)
        self.assertEqual(collection.name, group.title)
        self.assertEqual(collection.slug, group.slug)
        self.assertEqual(group.org.profile_type, 'org')


