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
        response = self.client.get(reverse('initiatives:manager', kwargs={
            'slug': ini.slug
        }), follow=True)
        self.assertContains(response, ini.name)


