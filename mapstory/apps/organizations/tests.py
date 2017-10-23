from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate, get_user

from geonode.layers.models import Layer

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.utils import get_test_user, create_mapstory, create_layer, create_user
from . import models

User = get_user_model()
testUser = get_test_user()


def get_test_organization():
    """Creates and returns a test Organization model"""
    return models.Organization.objects.create(
        title='Test',
        slogan='Slogan here',
        about='Yeah!'
    )


class TestOrganizations(TestCase):

    """Organizations' Tests."""
    def test_uses_template(self):
        c = Client()
        models.Organization()
        response = c.get(reverse('organizations:list'))
        self.assertTemplateUsed(response, template_name='organizations/organization_list.html')

    def test_organization_list_view(self):
        orgs = [
            models.Organization.objects.create(title='Test 02'),
            models.Organization.objects.create(title='Test 03'),
            models.Organization.objects.create(title='Test 000004'),
        ]

        c = Client()
        response = c.get(reverse('organizations:list'))
        self.assertEqual(200, response.status_code)

        for org in orgs:
            self.assertContains(response, org.title)

    def test_organization_detail_view(self):
        c = Client()
        o = get_test_organization()
        response = c.get(reverse('organizations:detail', kwargs={'pk': o.pk}))
        self.assertEqual(200, response.status_code)
        self.assertTemplateUsed(response, template_name='organizations/organization_detail.html')
        self.assertContains(response, o.title)
        self.assertContains(response, o.slogan)
        self.assertContains(response, o.about)

    def test_organization_membership_detail_view(self):
        c = Client()
        o = get_test_organization()
        # Create a user
        u = User.objects.create_user(username='testuser', password='asbdsandsandsandsa')
        # Make him a member
        m = models.OrganizationMembership.objects.create(user=u, organization=o)
        # Get the page
        response = c.get(reverse('organizations:member_detail', kwargs={'org_pk': o.pk, 'membership_pk': m.pk}))
        self.assertTemplateUsed(response, template_name='organizations/membership_detail.html')

    def test_organization_model(self):
        init_count = len(models.Organization.objects.all())
        o = models.Organization()
        o.title = "Test Organization"
        o.admin_user = testUser
        o.save()
        # Need to save before adding members!
        o.add_member(testUser)
        o.save()

        self.assertEqual(init_count + 1, models.Organization.objects.all().count())

        url = o.get_absolute_url()
        self.assertIsNotNone(url)
        self.assertIn(str(o.pk), str(url))
        self.assertEqual(o.admin_user, testUser)
        self.assertEqual(1, o.get_memberships().count())

    def test_add_member(self):
        o = models.Organization()
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
        o = models.Organization()
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
        o = models.Organization()
        o.title = "Test Organization 2"
        o.save()
        # Needs to be saved before you can add members or admins
        o.add_member(testUser, is_admin=True)
        admin_memberships = o.get_admin_memberships()
        self.assertEqual(1, admin_memberships.count())
        self.assertEqual(admin_memberships.first().user, testUser)

    def test_add_mapstory_without_membership(self):
        user = User.objects.create_user(
            username="usernametest",
            password="apassword"
        )
        o = models.Organization()
        o.title = "Testing"
        o.save()
        mapstory = create_mapstory(user, "Testing Mapstory")
        response = self.client.post(
            reverse("organizations:add_mapstory", kwargs={
                'pk': o.pk,
                'mapstory_pk': mapstory.pk
            }),
            {},
            follow=True
        )
        self.assertEqual(404, response.status_code)

    def test_promote_member_to_admin(self):
        o = get_test_organization()
        u = get_test_user()
        o.add_member(u)
        o.promote_member_to_admin(u)
        m = models.OrganizationMembership.objects.get(user=u, organization=o)
        self.assertTrue(m.is_admin)

    def test_add_mapstory_with_membership(self):
        user = get_test_user()
        self.assertTrue(self.client.login(username=user.username, password="glassonion232123"))
        o = get_test_organization()
        self.assertIsNotNone(o.add_member(user))
        mapstory = create_mapstory(user, "Testing Mapstory")
        self.assertIsNotNone(mapstory)

        initial_count = models.OrganizationMapStory.objects.filter(organization=o).count()
        response = self.client.post(
            reverse("organizations:add_mapstory", kwargs={
                'pk': o.pk,
                'mapstory_pk': mapstory.pk
            }),
            {'data': 'data'},
            follow=True
        )
        self.assertEqual(200, response.status_code)
        # Should have added 1 mapstory to the organization
        final_count = models.OrganizationMapStory.objects.filter(organization=o).count()
        self.assertEqual(initial_count + 1, final_count)

    def test_add_mapstory_helper(self):
        test_mapstory = create_mapstory(testUser, 'Testing Map 01')

        initial_count = models.OrganizationMapStory.objects.all().count()
        o = get_test_organization()
        membership = models.OrganizationMembership.objects.create(user=get_test_user(), organization=o, is_admin=True)

        self.assertIsNotNone(o.add_mapstory(test_mapstory, membership))
        self.assertEqual(initial_count + 1, models.OrganizationMapStory.objects.all().count())

    def test_add_layer(self):
        layer = create_layer('Test Layer', 'Abstract', get_test_user())
        self.assertIsNotNone(layer)

        o = get_test_organization()
        m = models.OrganizationMembership.objects.create(user=get_test_user(), organization=o, is_admin=True)
        count = models.OrganizationLayer.objects.all().count()
        o.add_layer(layer, m)
        self.assertEqual(count + 1, models.OrganizationLayer.objects.all().count())

    def test_add_url(self):
        o = get_test_organization()
        initial_count = o.get_urls().count()
        o.add_url('https://josellausas.com')
        self.assertEqual(initial_count + 1, o.get_urls().count())

    def test_remove_url(self):
        # TODO: Implement this
        pass

    def test_organization_page_content(self):
        o = get_test_organization()
        o.add_url('https://mapstory.org')
        # Add some members:
        o.add_member(
            User.objects.create_user(
                username="usernametest",
                password="apassword"
            ),
            is_admin=True
        )
        response = self.client.get(o.get_absolute_url())
        self.assertContains(response, 'usernametest')

    def test_anonymous_requst_to_join_redirects_to_sign_up(self):
        # TODO: Should redirect to the signup page when no user is signed up
        pass

    def test_request_to_join(self):
        organization = get_test_organization()
        # GET request should redirect us to the organization's page
        join_url = reverse(
            'organizations:request_membership',
            kwargs={'pk': organization.pk}
        )

        get_response = self.client.get(join_url, follow=True)
        self.assertEqual(get_response.status_code, 200)
        self.assertTemplateUsed("organization_detail")

        initial_request_count = models.JoinRequest.objects.all().count()
        user = get_test_user()
        # Login
        self.assertTrue(self.client.login(username='modeltester', password='glassonion232123'))

        response = self.client.post(
            reverse(
                'organizations:request_membership',
                kwargs={'pk': organization.pk}
            ),{'pk': organization.pk}, follow=True
        )
        self.assertEqual(response.status_code, 200)
        final_request_count = models.JoinRequest.objects.all().count()
        self.assertEqual(final_request_count, initial_request_count + 1)

    def test_duplicate_join_request(self):
        organization = get_test_organization()
        # Should not create another
        initial_request_count = models.JoinRequest.objects.all().count()
        user = get_test_user()
        # Login
        self.assertTrue(self.client.login(username='modeltester', password='glassonion232123'))

        response = self.client.post(
            reverse(
                'organizations:request_membership',
                kwargs={'pk': organization.pk}
            ), {'pk': organization.pk}, follow=True
        )
        self.assertEqual(response.status_code, 200)
        final_request_count = models.JoinRequest.objects.all().count()
        self.assertEqual(final_request_count, initial_request_count + 1)

        response = self.client.post(
            reverse(
                'organizations:request_membership',
                kwargs={'pk': organization.pk}
            ), {'pk': organization.pk}, follow=True
        )
        self.assertEqual(response.status_code, 200)
        final_request_count = models.JoinRequest.objects.all().count()
        self.assertEqual(final_request_count, initial_request_count + 1)

    def test_accept_request_to_join_and_decline(self):
        o = get_test_organization()
        u = get_test_user()
        j = models.JoinRequest.objects.create(organization=o, user=u)
        admin = User.objects.create_user(
            username='admin_tester',
            email='modeltester@models22.com',
            password='glassonion232123'
        )
        admin_membership = models.OrganizationMembership.objects.create(organization=o, user=admin, is_admin=True)
        j.approve(admin_membership)

        other_user = User.objects.create_user(
            username='user_tester',
            email='modeltester@models222.com',
            password='glassonion232123'
        )
        self.assertIsNotNone(models.OrganizationMembership.objects.get(organization=o, user=u))
        j2 = models.JoinRequest.objects.create(organization=o, user=other_user)
        j2.decline(admin_membership)

    def test_only_manager_can_accept_requests(self):
        # TODO: Verify that only manager has permissions to do this.
        pass

    def test_manager_post_social_media_changes(self):
        # Create an organization without social media.
        org = get_test_organization()

        # Check the details page for links.
        response = self.client.get(org.get_absolute_url())
        self.assertEqual(200, response.status_code)
        self.assertContains(response, org.title)

        management_url = reverse("organizations:manage", kwargs={'pk': org.pk})

        # Try to manage anonymously and get denied
        response = self.client.get(management_url, follow=True)
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "Log in to an existing account")

        # Try to post anonymously and get denied
        response = self.client.post(
            management_url,
            {'facebook': 'unodostre'},
            follow=True
        )
        self.assertEqual(200, response.status_code)
        self.assertContains(response, "Log in to an existing account")

        # Create user without permissions
        non_admin_user = User.objects.create_user(
            username='non_admin_tester',
            email='modeltester@organizations.com',
            password='wiuwiuwiuwiu'
        )
        non_admin_user.save()
        # Login as
        c = AdminClient()
        c.login_as_admin()

        # Should not get the management button
        response = c.get(org.get_absolute_url())
        self.assertNotContains(response, "MANAGE")

        # Try to manage as someone who is not and admin and get denied
        response = c.get(reverse("organizations:manage", kwargs={'pk': org.pk}), follow=True)
        self.assertEqual(200, response.status_code)
        self.assertTemplateUsed("organiazation_detail.html")

        # Try to post changes as someone who is not admin and get denied
        response = c.post(management_url, {
           'facebook': 'onetwothree'
        }, follow=True)
        self.assertEqual(200, response.status_code)
        self.assertTemplateUsed("organiazation_detail.html")

        # Check details page again for links.

    def test_access_with_admin_to_manager(self):
        c = AdminClient()
        c.login_as_admin()
        org = get_test_organization()
        r = c.get(reverse("organizations:manage", kwargs={'pk': org.pk}), follow=True)
        self.assertEqual(200, r.status_code)

    def test_request_approve_by_admin(self):
        o = get_test_organization()
        request = models.JoinRequest.objects.create(user=get_test_user(), organization=o)
        self.assertIsNotNone(request)
        admin_membership = models.OrganizationMembership.objects.create(
            user=get_test_user(),
            is_admin=True,
            organization=o
        )
        membership_count = models.OrganizationMembership.objects.all().count()
        request.approve(admin_membership)
        self.assertEqual(request.is_open, False)
        self.assertEqual(membership_count + 1, models.OrganizationMembership.objects.all().count())

    def test_request_decline_by_admin(self):
        o = get_test_organization()
        request = models.JoinRequest.objects.create(user=get_test_user(), organization=o)
        self.assertIsNotNone(request)
        admin_membership = models.OrganizationMembership.objects.create(
            user=get_test_user(),
            is_admin=True,
            organization=o
        )
        request.decline(admin_membership)
        self.assertEqual(request.is_open, False)

    def test_organization_detail_view_post_add_featured_layer(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk":o.pk}), data={
            "add_featured_layer": "quesito",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "add_featured_layer": "quesito",

            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_layer(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "remove_layer": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_featured_layer(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "remove_featured_layer": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_mapstory(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "remove_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_organization_detail_view_post_remove_featured_mapstory(self):
        o = get_test_organization()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "remove_featured_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_organization_detail_view_post_add_featured_mapstory(self):
        o = get_test_organization()
        u = get_test_user()
        map_created = create_mapstory(u, "Title")
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.OrganizationMembership.objects.create(organization=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("organizations:detail", kwargs={"pk": o.pk}), data={
            "add_featured_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": map_created.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_api_add_layer(self):
        org = get_test_organization()
        usr = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', usr)
        admin_membership = models.OrganizationMembership.objects.create(
            organization=org,
            user=usr,
        )
        initial_layer_count = models.OrganizationLayer.objects.count()

        # Attempt to login the client

        self.assertTrue(self.client.login(username=usr.username, password="glassonion232123"))

        response = self.client.post(
            reverse(
                'organizations:add_layer',
                kwargs={
                    'layer_pk': layer.pk,
                    'pk': org.pk
                }
            ),
            {'data': 'data'}
        )
        self.assertRedirects(
            response,
            expected_url=reverse("organizations:detail", kwargs={'pk': org.pk}))
        # Should update the Organization's layer count
        self.assertEqual(initial_layer_count + 1, models.OrganizationLayer.objects.count())
