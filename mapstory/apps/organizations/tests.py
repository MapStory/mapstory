from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate

from mapstory.tests.utils import get_test_user, create_mapstory
from .models import Organization, OrganizationURL, OrganizationMembership

User = get_user_model()
testUser = get_test_user()



class TestOrganizations(TestCase):
    """Organizations' Tests."""
    def test_uses_template(self):
        c = Client()
        response = c.get(reverse('organizations:list'))
        self.assertTemplateUsed(response, template_name='organizations/organization_list.html')

    def test_organization_list_view(self):
        orgs = [
            Organization.objects.create(title='Test 02'),
            Organization.objects.create(title='Test 03'),
            Organization.objects.create(title='Test 000004'),
        ]

        c = Client()
        response = c.get(reverse('organizations:list'))
        self.assertEqual(200, response.status_code)

        for org in orgs:
            self.assertContains(response, org.title)


    def test_organization_detail_view(self):
        c = Client()
        o = Organization.objects.create(
            title='Test',
            slogan='Slogan here',
            about='Yeah!'
        )
        response = c.get(reverse('organizations:detail', kwargs={'pk': o.pk}))
        self.assertEqual(200, response.status_code)
        self.assertTemplateUsed(response, template_name='organizations/organization_detail.html')
        self.assertContains(response, o.title)
        self.assertContains(response, o.slogan)
        self.assertContains(response, o.about)

    def test_organization_membership_detail_view(self):
        c = Client()
        o = Organization.objects.create(
            title='Test',
            slogan='Slogan here',
            about='Yeah!'
        )
        # Create a user
        u = User.objects.create_user(username='testuser', password='asbdsandsandsandsa')
        # Make him a member
        m = OrganizationMembership.objects.create(user=u, organization=o)
        # Get the page
        response = c.get(reverse('organizations:member_detail', kwargs={'org_pk': o.pk, 'membership_pk': m.pk}))
        self.assertTemplateUsed(response, template_name='organizations/membership_detail.html')

    def test_organization_model(self):
        init_count = len(Organization.objects.all())
        o = Organization()
        o.title = "Test Organization"
        o.admin_user = testUser
        o.save()
        # Need to save before adding members!
        o.add_member(testUser)
        o.save()

        self.assertEqual(init_count + 1, Organization.objects.all().count())

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
        organization = None
        mapstory = ""
        #response = self.client.get(
        #    reverse('organizations:add_mapstory'),
        #    kargs = {
        #        'org_pk' = organization.pk,
        #        'mapstory_pk' = mapstory.pk,
        #    }
        #)
        # TODO: Finish this
        pass

    def test_remove_mapstory(self):
        # TODO: Finish this
        pass

    def test_add_layer(self):
        # TODO: Finish this
        pass

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

    def test_add_member_view(self):
        pass

    def test_add_mapstory_view(self):
        pass

    def test_add_layer_view(self):
        pass

