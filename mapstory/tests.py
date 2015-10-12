import os
from account.models import EmailConfirmation
from django.test import TestCase, Client
from django.conf import settings
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model, authenticate
from django.contrib.staticfiles import finders
from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from geonode.layers.models import Layer
from geonode.layers.populate_layers_data import create_layer_data
from mapstory.models import Community, DiaryEntry

User = get_user_model()


class AdminClient(Client):

    def login_as_admin(self, username='admin', password='admin'):
        """
        Convenience method to login admin.
        """
        return self.login(**{'username': username, 'password': password})

    def login_as_non_admin(self, username='non_admin', password='non_admin'):
        """
        Convenience method to login a non-admin.
        """
        return self.login(**{'username': username, 'password': password})

class MapStoryTestMixin(TestCase):

    def assertLoginRequired(self, response):
        self.assertEqual(response.status_code, 302)
        self.assertTrue('login' in response.url)

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = User.objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password


class MapStoryTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """

    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

    def test_home_renders(self):
        """
        Ensure the home page returns a 200.
        """

        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)

    def test_search_renders(self):
        """
        Ensure the search page returns a 200.
        """

        c = Client()
        response = c.get(reverse('search'))
        self.assertEqual(response.status_code, 200)

    def test_journal_renders(self):
        """
        Ensure the journal functionality works.
        """

        c = AdminClient()
        response = c.get(reverse('diary'))
        self.assertEqual(response.status_code, 200)

        response = c.get(reverse('diary-create'))
        self.assertLoginRequired(response)

        c.login_as_non_admin()
        response = c.get(reverse('diary-create'))
        self.assertEqual(response.status_code, 200)

        response = c.get(reverse('diary-detail', args=[1]))
        self.assertEqual(response.status_code, 404)

        data = {'title': 'testing a new journal', 'content': 'This is test content'}
        response = c.post(reverse('diary-create'), data=data, follow=True)
        self.assertEqual(response.status_code, 200)

        journal = DiaryEntry.objects.get(title=data['title'])
        self.assertEqual(journal.author, response.context['user'])
        self.assertEqual(journal.content, data['content'])
        self.assertFalse(journal.publish)
        self.assertFalse(journal.show_on_main)

        data['publish'] = True
        data['show_on_main'] = True

        response = c.post(reverse('diary-update', args=[journal.id]), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        journal = DiaryEntry.objects.get(title=data['title'])
        self.assertTrue(journal.publish)
        self.assertFalse(journal.show_on_main)

        response = c.get(reverse('diary'))
        self.assertIn(journal, response.context['object_list'])

    def test_sign_up_renders(self):
        """
        Ensure the sign up page returns a 200.
        """

        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)

    def test_new_map_renders(self):
        """
        Ensure the new map page returns a 200.
        """

        c = AdminClient()
        response = c.get(reverse('new_map'))
        self.assertLoginRequired(response)

        c.login_as_admin()
        response = c.get(reverse('new_map'))
        self.assertEqual(response.status_code, 200)

    def test_new_map_json_renders(self):
        """
        Ensure the new map json returns a 200.
        """

        c = AdminClient()
        response = c.get(reverse('new_map_json'))
        self.assertLoginRequired(response)

        c.login_as_admin()
        response = c.get(reverse('new_map_json'))
        self.assertEqual(response.status_code, 200)

    def test_story_teller_renders(self):
        """
        Ensure the story teller view renders.
        """
        c = AdminClient()
        response = c.get(reverse('profile_detail', args=['nope']))
        self.assertEqual(response.status_code, 404)

        response = c.get(reverse('profile_detail', args=['admin']))
        self.assertEqual(response.status_code, 200)

        # make sure user cannot delete if not logged in
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertLoginRequired(response)

        # delete someone else's profile should result in 403 response forbidden
        c.login_as_non_admin()
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertEqual(response.status_code, 403)

        c.login_as_admin()
        response = c.get(reverse('profile_delete', args=['admin']))
        self.assertEqual(response.status_code, 200)

    def test_editor_tour_renders(self):
        """
        Ensure the editor tour view renders.
        """
        c = Client()
        response = c.get(reverse('editor_tour'))
        self.assertEqual(response.status_code, 200)

    def test_initiative_renders(self):
        """
        Ensure the initiative view renders.
        """
        c = Client()
        response = c.get(reverse('community-detail', args=['nope']))
        self.assertEqual(response.status_code, 404)
        icon = SimpleUploadedFile(name='test_image.png',
                               content=open(finders.find('mapstory/img/img_95x65.png'), 'rb').read(),
                               content_type='image/png')

        community = Community(name='testing', icon=icon)
        community.save()
        response = c.get(reverse('community-detail', kwargs=dict(slug='testing')))
        self.assertEqual(response.status_code, 200)

    def test_about_leaders_page_renders(self):
        """
        Ensure the about leaders page view renders.
        """
        c = Client()
        response = c.get(reverse('about-leaders'))
        self.assertEqual(response.status_code, 200)

    def test_donate_renders(self):
        """
        Ensure the donate view renders.
        """
        c = Client()
        response = c.get(reverse('donate'))
        self.assertEqual(response.status_code, 200)

    def test_layer_upload_renders(self):
        """
        Ensure the layer upload view renders.
        """
        c = AdminClient()
        response = c.get(reverse('layer_upload'))
        self.assertLoginRequired(response)

        c.login_as_non_admin()
        response = c.get(reverse('layer_upload'))
        self.assertEqual(response.status_code, 200)

    def test_get_started_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['started']))
        self.assertEqual(response.status_code, 200)

    def test_get_involved_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['involved']))
        self.assertEqual(response.status_code, 200)

    def test_get_skills_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['skills']))
        self.assertEqual(response.status_code, 200)

    def test_sign_in_renders(self):
        """
        Ensure the sign in renders.
        """
        c = Client()
        response = c.get(reverse('account_login'))
        self.assertEqual(response.status_code, 200)

        response = c.post(reverse('account_login'), data={'username': self.non_admin_username,
                                                          'password': self.non_admin_password})
        self.assertEqual(response.status_code, 302)
        c.logout()

        response = c.post(reverse('account_login'), data={'username': 'nope',
                                                          'password': 'nope'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['form'].errors['__all__'][0],
                         'The username and/or password you specified are not correct.')

    def test_sign_up(self):
        """
        Ensure the signup works.
        """

        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        data = dict(username='test', firstname='test', lastname='user', email='test@example.com', password='test',
                    password_confirm='test')

        response = c.post(reverse('account_signup'), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        # make sure the custom subject template is being used
        self.assertEqual(mail.outbox[0].subject, 'Account activation on MapStory')
        conf = EmailConfirmation.objects.first()
        self.assertTrue(conf.key in mail.outbox[0].body)

        response = c.get(reverse('account_confirm_email', args=[conf.key]))
        self.assertEqual(response.status_code, 200)

        user = authenticate(**data)
        self.assertTrue(user)
        self.assertEqual(user.username, data['username'])
        self.assertEqual(user.first_name, data['firstname'])
        self.assertEqual(user.last_name, data['lastname'])
        self.assertEqual(user.email, data['email'])

#
# class MapStoryTestsWorkFlowTests(MapStoryTestMixin):
#
#     def setUp(self):
#         # these are needed for the geonode fixtures
#         TopicCategory.objects.create(identifier='biota')
#         TopicCategory.objects.create(identifier='location')
#         TopicCategory.objects.create(identifier='elevation')
#
#         create_models(type='layer')
#         create_layer_data()
#
#     def test_layer(self):
#         layer = Layer.objects.first()
#         c = Client()
#         response = c.get(reverse('layer_detail', args=[layer.typename]))
#         self.assertEqual(response.status_code, 200)
#
#         response = c.get(reverse('layer_metadata', args=[layer.typename]))
#         self.assertLoginRequired(response)
#
#         response = c.get(reverse('layer_edit', args=[layer.typename]))
#         self.assertLoginRequired(response)



