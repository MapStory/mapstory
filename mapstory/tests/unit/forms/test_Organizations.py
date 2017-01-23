'''
from django.core.urlresolvers import reverse

from bs4 import BeautifulSoup

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin


class TestOrganizations(MapStoryTestMixin):
    def test_organization_form(self):
        admin = AdminClient()
        admin.login_as_admin()

        # Get an empty form
        response = admin.get(reverse('organization_create'), follow=True)
        # self.assertEqual(response.status_code, 200)

        # Test for correct redirect
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, reverse('organization_create'), status_code=302, target_status_code=200)

        soup = BeautifulSoup(response.content)

        # Should have 27 fields total
        self.assertEqual(len(soup.find_all('input')), 28)
'''
