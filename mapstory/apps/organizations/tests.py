from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate

from mapstory.tests.utils import get_test_user, create_mapstory
from .models import Organization, OrganizationURL

User = get_user_model()
testUser = get_test_user()


class TestOrganizations(TestCase):
    """Organizations' Tests."""

    def test_organization_url_resolves(self):
        c = Client()
        response = c.get(reverse('organizations:list'))

        self.assertEqual(200, response.status_code)

    def test_uses_template(self):
        c = Client()
        response = c.get(reverse('organizations:list'))
        self.assertTemplateUsed(response, template_name='organizations/organization_list.html')

    def test_organization_list_view(self):
        # TODO: Implement this
        pass

    def test_organization_detail_view(self):
        # TODO: Implement this
        pass

    def test_organization_membership_detail_view(self):
        # TODO: Implement this
        pass

    def test_organization_model(self):
        init_count = len(Organization.objects.all())
        o = Organization()
        o.title = "Test Organization"
        o.admin_user = testUser
        o.save()

        o.add_member(testUser)
        o.save()

        self.assertEqual(init_count + 1, len(Organization.objects.all()))

        url = o.get_absolute_url()
        self.assertIsNotNone(url)
        self.assertIn(str(o.pk), str(url))
        self.assertEqual(o.admin_user, testUser)
        self.assertEqual(1, o.get_memberships().count())

    def test_add_member(self):
        o = Organization()
        o.title = "Test Organization 2"
        o.admin_user = testUser
        o.save()

        initial_count = o.get_memberships().count()
        o.add_member(testUser)
        o.save()
        self.assertEqual(initial_count + 1 , o.get_memberships().count())

        other_user = User.objects.create_user(
            username='modeltester2',
            email='modelteste2r@models.com',
            password='glassonion2321223'
        )

        o.add_member(other_user)
        o.save()
        self.assertEqual(initial_count + 2, o.get_memberships().count())


    def test_remove_member(self):
        o = Organization()
        o.title = "Test Organization 2"
        o.admin_user = testUser
        o.save()

        initial_count = o.get_memberships().count()
        o.add_member(testUser)
        o.save()
        self.assertEqual(initial_count + 1, o.get_memberships().count())

        o.remove_member(testUser)
        o.save()
        self.assertEqual(initial_count, o.get_memberships().count())


    def test_set_admin(self):
        o = Organization()
        o.title = "Test Organization 2"
        o.save()
        # Needs to be saved before you can add members or admins
        o.add_member(testUser, is_admin=True)
        admin_memberships = o.get_admin_memberships()
        self.assertEqual(1, admin_memberships.count())
        self.assertEqual(admin_memberships.first().user, testUser)


    def test_add_mapstory(self):
        pass
        # TODO: Finish this

    def test_remove_mapstory(self):
        self.fail("****************")
        # TODO: Finish this

    def test_add_layer(self):
        self.fail("****************")
        # TODO: Finish this

    def test_remove_layer(self):
        # TODO: Implement this
        pass

    def test_add_url(self):
        o = Organization()
        o.title = "Test"
        o.save()
        initial_count = o.get_urls().count()
        o.add_url('https://josellausas.com')
        self.assertEqual(initial_count + 1, o.get_urls().count())

    def test_remove_url(self):
        # TODO: Implement this
        pass
