from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from mapstory.tests.utils import get_test_user, create_mapstory, create_layer, create_user

from . import models

# User models
User = get_user_model()


def get_user(username, email, password):
    user, created = User.objects.get_or_create(
        username=username, email=email
    )
    if created:
        user.set_password(password)
        user.save()
    return user


def get_initiative():
    """
    Returns a test Initiative.
    :return: A test Inititive.
    """
    return models.Initiative.objects.create(
        name='Test Initiative',
        slogan='Hey there',
        about='More info'
    )


class TestInitiativesModels(TestCase):
    """
    Initiative Models tests.
    """
    def test_get_absolute_url(self):
        ini = get_initiative()
        url = ini.get_absolute_url()
        self.assertIsNotNone(url)
        self.assertTrue(ini.slug in url)

    def test_initiative_slugs(self):
        ini = get_initiative()
        self.assertIsNotNone(ini.slug)
        # Use the same name from the other initiative.
        ini2 = models.Initiative.objects.create(
            name=ini.name,
            slogan=ini.slogan,
            about=ini.about
        )
        # Should have different slugs.
        self.assertNotEqual(ini.slug, ini2.slug)

    def test_memberships(self):
        ini = get_initiative()
        usr = get_test_user()
        member = models.InitiativeMembership.objects.create(
            initiative=ini,
            user=usr,
        )
        self.assertIsNotNone(member)
        self.assertEqual(False, member.is_admin)
        self.assertEqual(member.user.pk, usr.pk)
        self.assertEqual(member.initiative.pk, ini.pk)

    def test_join_request(self):
        ini = get_initiative()
        usr = get_test_user()
        join = models.JoinRequest.objects.create(
            initiative=ini,
            user=usr,
        )
        self.assertIsNotNone(join)
        self.assertEqual(join.initiative.pk, ini.pk)
        self.assertEqual(join.user.pk, usr.pk)
        self.assertEqual(True, join.is_open)
        self.assertIsNone(join.approved_by)

        admin_usr = get_user("some_admin", "some_admin@admin.com", "adminadmin")
        admin_membership = models.InitiativeMembership.objects.create(
            user=admin_usr,
            initiative=ini,
            is_admin=True
        )
        new_membership = join.approve(admin_membership)
        self.assertIsNotNone(new_membership)
        self.assertFalse(join.is_open)
        self.assertEqual(join.approved_by, admin_membership)
        self.assertFalse(new_membership.is_admin)
        self.assertEqual(new_membership.user.pk, usr.pk)

    def test_add_layer(self):
        layer = create_layer('Test Layer', 'Abstract', get_test_user())
        self.assertIsNotNone(layer)

        o = get_initiative()
        m = models.InitiativeMembership.objects.create(user=get_test_user(), initiative=o, is_admin=True)
        count = models.InitiativeLayer.objects.all().count()
        o.add_layer(layer, m)
        self.assertEqual(count + 1, models.InitiativeLayer.objects.all().count())

    def test_add_mapstory_helper(self):
        test_mapstory = create_mapstory(get_test_user(), 'Testing Map 01')

        initial_count = models.InitiativeMapStory.objects.all().count()
        o = get_initiative()
        membership = models.InitiativeMembership.objects.create(user=get_test_user(), initiative=o, is_admin=True)

        self.assertIsNotNone(o.add_mapstory(test_mapstory, membership))
        self.assertEqual(initial_count + 1, models.InitiativeMapStory.objects.all().count())


class TestInitiativesAPI(TestCase):
    """
    Initiative API tests.
    """
    def login(self):
        return self.client.login(username='modeltester', password='glassonion232123')

    def test_initiatives_url(self):
        response = self.client.get('/initiatives', follow=True)
        self.assertEqual(200, response.status_code)

    def test_initiative_detail_page(self):
        ini = get_initiative()
        self.assertIsNotNone(ini)
        response = self.client.get(ini.get_absolute_url())
        self.assertContains(response, ini.name)
        self.assertContains(response, ini.slogan)
        self.assertContains(response, ini.about)

    def test_initiative_list_page(self):
        get_initiative()
        models.Initiative.objects.create(name="Test2", slogan="Test2", about="test2")
        models.Initiative.objects.create(name="Test3", slogan="Test3", about="test3")
        models.Initiative.objects.create(name="Test4", slogan="Test4", about="test4")
        all_inis = models.Initiative.objects.all()

        response = self.client.get(reverse('initiatives:list'), follow=True)
        # Should list all initiatives
        for ini in all_inis:
            self.assertContains(response, ini.name)

    def test_request_join(self):
        ini = get_initiative()
        usr = get_test_user()
        self.assertTrue(
            self.client.login(username=usr.username, password='glassonion232123')
        )
        count = models.JoinRequest.objects.count()
        response = self.client.post(
            reverse('initiatives:request_membership', kwargs={
                'slug': ini.slug,
            }),
            follow=True,
            data={'hi': 'hello'}
        )
        self.assertTrue(200 == response.status_code)
        self.assertTrue((count + 1) == models.JoinRequest.objects.count())

    def test_manager_page(self):
        admin_usr = get_test_user()
        ini = get_initiative()
        admin_membership = ini.add_member(admin_usr, is_admin=True)
        self.assertTrue(admin_membership.is_admin)
        self.assertTrue(self.login())
        response = self.client.get(reverse('initiatives:manage', kwargs={
            'slug': ini.slug
        }), follow=True)
        self.assertContains(response, ini.name)

    def test_join_this_initiative(self):
        usr = get_test_user()
        ini = get_initiative()
        count = models.JoinRequest.objects.all().count()
        self.assertTrue(
            self.client.login(username=usr.username, password='glassonion232123')
        )
        response = self.client.post(
            reverse('initiatives:request_membership', kwargs={'slug': ini.slug}),
            data={'data': 'data'},
            follow=True
        )

        self.assertEqual(200, response.status_code)
        new_count = models.JoinRequest.objects.all().count()
        self.assertTrue(count + 1 == new_count)

    def test_request_membership_without_auth(self):
        ini = get_initiative()
        usr = get_test_user()
        response = self.client.post(
            reverse('initiatives:request_membership', kwargs={
                'slug': ini.slug,
            }),
            follow=True,
            data={'hi': 'hello'}
        )
        self.assertTrue(200 == response.status_code)
        self.assertTemplateNotUsed('initiatives/detail.html')

    def test_manager_unauthorized(self):
        ini = get_initiative()
        response = self.client.get(reverse('initiatives:manage', kwargs={'slug': ini.slug}), follow=True)

    def test_manager_post_form(self):
        ini = get_initiative()
        usr = get_test_user()
        admin_membership = ini.add_member(usr, is_admin=True)
        self.assertTrue(
            self.client.login(username=usr.username, password='glassonion232123')
        )
        response = self.client.post(
            reverse('initiatives:manage', kwargs={'slug': ini.slug}),
            follow=True,
            data={
                'name': 'test',
                'slogan': 'test',
                'city': 'test',
                'country': 'test',
                'image': None,
                'about': 'test',
            }
        )
        self.assertEqual(200, response.status_code)

    def test_approve_membership(self):
        ini = get_initiative()
        usr = get_test_user()
        join = models.JoinRequest.objects.create(
            initiative=ini,
            user=usr,
        )
        self.assertIsNotNone(join)
        self.assertEqual(join.initiative.pk, ini.pk)
        self.assertEqual(join.user.pk, usr.pk)
        self.assertEqual(True, join.is_open)
        self.assertIsNone(join.approved_by)

        admin_usr = get_user("some_admin", "some_admin@admin.com", "adminadmin")
        admin_membership = models.InitiativeMembership.objects.create(
            user=admin_usr,
            initiative=ini,
            is_admin=True
        )
        new_membership = join.approve(admin_membership)
        self.assertIsNotNone(new_membership)
        self.assertFalse(join.is_open)
        self.assertEqual(join.approved_by, admin_membership)
        self.assertFalse(new_membership.is_admin)
        self.assertEqual(new_membership.user.pk, usr.pk)
        self.assertTrue(self.client.login(username='some_admin', password="adminadmin"))
        response = self.client.post(
            reverse('initiatives:approve_membership', kwargs={
                'slug': ini.slug
            }),
            follow=True,
            data={
                'request_pk': join.pk,
                'approval': 'accept'
            }
        )
        self.assertEqual(200, response.status_code)

    def test_deny_membership(self):
        ini = get_initiative()
        usr = get_test_user()
        join = models.JoinRequest.objects.create(
            initiative=ini,
            user=usr,
        )
        self.assertIsNotNone(join)
        self.assertEqual(join.initiative.pk, ini.pk)
        self.assertEqual(join.user.pk, usr.pk)
        self.assertEqual(True, join.is_open)
        self.assertIsNone(join.approved_by)

        admin_usr = get_user("some_admin", "some_admin@admin.com", "adminadmin")
        admin_membership = models.InitiativeMembership.objects.create(
            user=admin_usr,
            initiative=ini,
            is_admin=True
        )
        new_membership = join.approve(admin_membership)
        self.assertIsNotNone(new_membership)
        self.assertFalse(join.is_open)
        self.assertEqual(join.approved_by, admin_membership)
        self.assertFalse(new_membership.is_admin)
        self.assertEqual(new_membership.user.pk, usr.pk)
        self.assertTrue(self.client.login(username='some_admin', password="adminadmin"))
        response = self.client.post(
            reverse('initiatives:approve_membership', kwargs={
                'slug': ini.slug
            }),
            follow=True,
            data={
                'request_pk': join.pk,
                'approval': 'decline'
            }
        )
        self.assertEqual(200, response.status_code)

    def test_api_add_layer(self):
        ini = get_initiative()
        usr = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', usr)
        models.InitiativeMembership.objects.create(
            initiative=ini,
            user=usr,
            is_admin=True,
        )
        initial_layer_count = models.InitiativeLayer.objects.count()

        # Attempt to login the client
        self.assertTrue(self.client.login(username=usr.username, password="glassonion232123"))

        response = self.client.post(
            reverse(
                'initiatives:add_layer',
                kwargs={
                    'layer_pk': layer.pk,
                    'slug': ini.slug
                }
            ),
            {'data': 'data'}
        )
        self.assertRedirects(
            response,
            expected_url=reverse("initiatives:detail", kwargs={'slug': ini.slug}))
        # Should update the Initiatives's layer count
        self.assertEqual(initial_layer_count + 1, models.InitiativeLayer.objects.count())

    def test_add_mapstory_with_membership(self):
        user = get_test_user()
        self.assertTrue(self.client.login(username=user.username, password="glassonion232123"))
        o = get_initiative()
        self.assertIsNotNone(o.add_member(user, is_admin=True))
        mapstory = create_mapstory(user, "Testing Mapstory")
        self.assertIsNotNone(mapstory)

        initial_count = models.InitiativeMapStory.objects.filter(initiative=o).count()
        response = self.client.post(
            reverse("initiatives:add_mapstory", kwargs={
                'slug': o.slug,
                'mapstory_pk': mapstory.pk
            }),
            {'data': 'data'},
            follow=True
        )
        self.assertEqual(200, response.status_code)
        # Should have added 1 mapstory to the initiative
        final_count = models.InitiativeMapStory.objects.filter(initiative=o).count()
        self.assertEqual(initial_count + 1, final_count)

    def test_add_mapstory_without_membership(self):
        user = User.objects.create_user(
            username="usernametest",
            password="apassword"
        )
        count = models.InitiativeMapStory.objects.all().count()
        o = get_initiative()
        mapstory = create_mapstory(user, "Testing Mapstory")
        response = self.client.post(
            reverse("initiatives:add_mapstory", kwargs={
                'slug': o.slug,
                'mapstory_pk': mapstory.pk
            }),
            {},
            follow=True
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(count, models.InitiativeMapStory.objects.all().count())

    def test_add_featured_layer(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "add_featured_layer": "quesito",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "add_featured_layer": "quesito",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_layer(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "remove_layer": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_featured_layer(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "remove_featured_layer": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(200, r.status_code)

    def test_organization_detail_view_post_remove_mapstory(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "remove_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_organization_detail_view_post_remove_featured_mapstory(self):
        o = get_initiative()
        u = get_test_user()
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "remove_featured_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": layer.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_organization_detail_view_post_add_featured_mapstory(self):
        o = get_initiative()
        u = get_test_user()
        map_created = create_mapstory(u, "Title")
        layer = create_layer('Test Layer', 'Abstract', u)
        membership = models.InitiativeMembership.objects.create(initiative=o, user=u)
        o.add_layer(layer, membership)
        r = self.client.post(reverse("initiatives:detail", kwargs={"slug": o.slug}), data={
            "add_featured_mapstory": "q",
            "layer_pk": layer.pk,
            "mapstory_pk": map_created.pk,
        })
        self.assertEqual(404, r.status_code)

    def test_api_url(self):
        response = self.client.get('/initiatives/api/initiative', follow=True)
        self.assertEqual(200, response.status_code)
