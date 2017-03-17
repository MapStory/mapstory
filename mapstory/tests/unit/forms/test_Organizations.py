from django.core.urlresolvers import reverse

from bs4 import BeautifulSoup

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin


class TestOrganizations(MapStoryTestMixin):
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

        admin_client = AdminClient()
        admin_client.login_as_admin()

    def test_organization_form(self):
        admin = AdminClient()
        admin.login_as_admin()

        # Get an empty form
        response = admin.get(reverse('organization_create'))
        self.assertEqual(response.status_code, 200)

        soup = BeautifulSoup(response.content)

        # Should have 28 fields total
        self.assertEqual(len(soup.find_all('input')), 27)

