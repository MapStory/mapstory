from django.contrib.auth import get_user_model, authenticate
from django.test import TestCase, Client
from geonode.geoserver.helpers import gs_catalog
from socket import error as socket_error
from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from .AdminClient import AdminClient
from django.core.urlresolvers import reverse
from geonode.groups.models import GroupProfile, GroupMember
from geonode.contrib.collections.models import Collection
from datetime import datetime
from unittest import skip
from bs4 import BeautifulSoup
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

class MapStoryOrganizationTests(MapStoryTestMixin):
    """Organization Tests

    These are the URLs for the Organizations API
    --------------------------------------------
        url(r'^organizations/create/$', organization_create, name='organization_create'),
        url(r'^organizations/(?P<slug>[^/]*)$', organization_detail, name='organization_detail'),
        url(r'^organizations/edit/(?P<slug>[^/]*)$', organization_edit, name='organization_edit'),
        url(r'^organizations/members/(?P<slug>[^/]*)$', organization_members, name='organization_members'),
        url(r'^organizations/invite/(?P<slug>[^/]*)$', organization_invite, name='organization_invite'),
        url(r'^organizations/(?P<slug>[^/]*)/members_add/$', organization_members_add, name='organization_members_add'),
        url(r'^organizations/(?P<slug>[^/]*)/member_remove/(?P<username>.+)$', organization_member_remove, name='organization_member_remove'),
    """

    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

        admin = AdminClient()
        admin.login_as_admin()

        # Create new organization
        form_data = {
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

        response = admin.post(reverse('organization_create'), data=form_data, follow=True)
        self.assertEqual(response.status_code, 200)
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/organizations/' + form_data['slug'], status_code=302, target_status_code=200)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)

    def test_guest_access_redirect(self):
        """Guests should be redirected to login
        """
        c = AdminClient()
        response = c.get(reverse('organization_create'), follow=True)
        # Should redirect to login
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/account/login/?next=/organizations/create/', status_code=302,
                             target_status_code=200)
        self.assertEqual(last_url, 'http://testserver/account/login/?next=/organizations/create/')

    def test_user_access_denied(self):
        """Regular users should not get access
        """
        c = AdminClient()
        c.login_as_non_admin()
        response = c.get(reverse('organization_create'), follow=True)
        self.assertEqual(response.status_code, 403)

    def test_slug_get(self):
        """Test slug
        """
        c = Client()
        response = c.get(reverse('organization_detail', args=['Test-Organization']))
        self.assertEqual(response.status_code, 200)

        response = c.get(reverse('organization_members', args=['Test-Organization']))
        self.assertEqual(response.status_code, 200)

        # response = c.get(reverse('organization_detail', args=['Test-Organization-nonexist']))
        # self.assertEqual(response.status_code, 404)

        # response = c.get(reverse('organization_members', args=['Test-Organization-nonexist']))
        # self.assertEqual(response.status_code, 404)

    def test_admin_access(self):
        """Admin should get access
        """
        admin = AdminClient()
        admin.login_as_admin()
        response = admin.get(reverse('organization_create'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    def test_member_404(self):
        c = AdminClient()
        c.login_as_non_admin()
        response = c.get(reverse('organization_members', args=['Test-Organization-nonexistent']))
        self.assertEqual(response.status_code, 404)

    def test_organization_create(self):
        """Organization create
        url(r'^organizations/create/$', organization_create, name='organization_create'),
        """
        admin = AdminClient()
        admin.login_as_admin()
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)
        manager = group.get_managers().all()
        # Should only have 1 manager
        self.assertEqual(len(manager), 1)
        self.assertEqual(group.profile_type, 'org')

    def test_organization_create_post(self):
        """Should create a new organization
        """
        admin = AdminClient()
        admin.login_as_admin()

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

        response = admin.post(reverse('organization_create'), data=form_data, follow=True)
        self.assertEqual(response.status_code, 200)

        # When the organization is created, a GroupProfile and Collection model pointing to it should be created
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)
        self.assertEqual(collection.name, group.title)
        self.assertEqual(collection.slug, group.slug)
        self.assertEqual(group.profile_type, 'org')

    def test_organization_create_get(self):
        """Should return an empty form.
        """
        admin = AdminClient()
        admin.login_as_admin()

        response = admin.get(reverse('organization_create'), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_organization_edit(self):
        """Organization Edit

        """
        admin = AdminClient()
        admin.login_as_admin()

        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)

        # Test editing the organization
        form_data = {
            'title': 'Test Organization',
            'description': 'Edit',
            'keywords': 'edit',
            'profile_type': 'org',
            'access': 'public',
            'slug': 'Test-Organization',
            'date_joined': datetime.now()
        }

        response = admin.post(reverse('organization_edit', args=[group.slug]), data=form_data, follow=True)
        self.assertEqual(response.status_code, 200)
        # Redirect when form is submitted, therefore 302
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/organizations/' + form_data['slug'], status_code=302, target_status_code=200)

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

        response = c.get(reverse('organization_members', args=[group.slug]))
        self.assertEqual(response.status_code, 200)

    @skip("TODO")
    def test_public_access_type(self):
        print("TODO")

    @skip("TODO")
    def test_access_type_invite(self):
        print("TODO")

    @skip("TODO")
    def test_access_type_private(self):
        print("TODO")

    def test_organization_members(self):
        """Organization members
        url(r'^organizations/members/(?P<slug>[^/]*)$', organization_members, name='organization_members'),
        """
        admin = AdminClient()
        admin.login_as_admin()
        response = admin.get(reverse('organization_members', args=['Test-Organization']), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_organization_invite(self):
        """Organization invite
        url(r'^organizations/invite/(?P<slug>[^/]*)$', organization_invite, name='organization_invite'),
        """
        admin = AdminClient()
        admin.login_as_admin()

        # Should reject GET requests
        response = admin.get(reverse('organization_invite', args=['Test-Organization']), follow=True)
        self.assertEqual(response.status_code, 405)

        # TODO: Put good data in here
        form_data = {
        }

        # Should accept POST requests
        response = admin.post(reverse('organization_invite', args=['Test-Organization']), follow=True, data=form_data)
        self.assertEqual(response.status_code, 200)

        # Should end up in 'organization_members'
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, reverse('organization_members', args=['Test-Organization']), status_code=302,
                             target_status_code=200)

    def test_organization_members_add(self):
        """Organization member add
        url(r'^organizations/(?P<slug>[^/]*)/members_add/$', organization_members_add, name='organization_members_add'),
        """
        admin = AdminClient()
        admin.login_as_admin()

        # Should reject GET requests
        response = admin.get(reverse('organization_members_add', args=['Test-Organization']), follow=True)
        self.assertEqual(response.status_code, 405)

        # TODO: Put good data in here
        form_data = {
        }

        # Should accept POST requests
        response = admin.post(reverse('organization_members_add', args=['Test-Organization']), follow=True,
                              data=form_data)
        self.assertEqual(response.status_code, 200)

        # Should end up in 'organization_members'
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, reverse('organization_detail', args=['Test-Organization']), status_code=302,
                             target_status_code=200)

    # http://stackoverflow.com/questions/11885211/how-to-write-a-unit-test-for-a-django-view
    def test_organization_member_remove(self):
        """Organization member remove
        url(r'^organizations/(?P<slug>[^/]*)/member_remove/(?P<username>.+)$', organization_member_remove, name='organization_member_remove'),
        """
        admin = AdminClient()
        admin.login_as_admin()

        # Should reject GET requests
        response = admin.get(reverse('organization_member_remove', args=['Test-Organization', 'admin']), follow=True)
        self.assertEqual(response.status_code, 200)

        # TODO: Put good data in here
        form_data = {
        }

        # Should accept POST requests
        response = admin.post(reverse('organization_member_remove', args=['Test-Organization', 'admin']), follow=True,
                              data=form_data)
        self.assertEqual(response.status_code, 403)

        # Should end up in 'organization_members'
        # last_url, status_code = response.redirect_chain[-1]
        # self.assertRedirects(response, reverse('organization_detail', args=['Test-Organization']) ,status_code=302, target_status_code=200)
        #

    def test_organization_manager(self):
        group = GroupProfile.objects.get(slug='Test-Organization')
        managers = group.get_managers().all()
        self.assertEqual(len(managers), 1)
        self.assertEqual(managers[0].username, 'admin')

    def test_organization_form(self):
        admin = AdminClient()
        admin.login_as_admin()

        # Get an empty form
        response = admin.get(reverse('organization_create'))
        self.assertEqual(response.status_code, 200)

        soup = BeautifulSoup(response.content)

        # Should have 27 fields total
        self.assertEqual(len(soup.find_all('input')), 27)

