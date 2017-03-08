from django.core.urlresolvers import reverse
from django.test import Client, TestCase
from mapstory.tests.AdminClient import AdminClient

from mapstory.views import organization_create, organization_edit, organization_detail, organization_members

class TestOrganizationsView(TestCase):
    def test_view_imports(self):
        self.assertIsNotNone(organization_create, "Failed to import 'organization_create'")
        self.assertIsNotNone(organization_edit, "Failed to import 'organization_edit'")
        self.assertIsNotNone(organization_detail, "Failed to import 'organization_detail'")
        self.assertIsNotNone(organization_members, "Failed to import 'organization_members'")

    def test_url_api(self):
        self.assertEqual(reverse('organization_create'), u'/organizations/create/')
        self.assertEqual(reverse('organization_edit', kwargs={'slug': 'testslug'}), u'/organizations/edit/testslug')
        self.assertEqual(reverse('organization_detail', kwargs={'slug': 'testslug'}), u'/organizations/testslug')
        self.assertEqual(reverse('organization_members', kwargs={'slug': 'testslug'}), u'/organizations/members/testslug')

    def test_create_template(self):
        # TODO: Figure out the template
        # Should use the correct template
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertContains(response, "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">", count=1, status_code=200, html=False)
        # self.assertTemplateUsed()
        # 
    
    def test_organization_create_auth_required(self):
        """Guests should not be allowed.

        Guests should be redirected when not given access.
        """
        admin_client = AdminClient()
        response = admin_client.get(reverse('organization_create'), follow=True)

        # Test correct redirect to login page
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/account/login/?next=/organizations/create/', status_code=302,
                             target_status_code=200)
        self.assertEqual(last_url, 'http://testserver/account/login/?next=/organizations/create/')
