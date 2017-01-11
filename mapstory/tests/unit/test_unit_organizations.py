from django.test import TestCase

from django.core.urlresolvers import reverse

from mapstory.views import organization_create, organization_edit, organization_detail, organization_members

class TestUnitOrganizations(TestCase):
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

