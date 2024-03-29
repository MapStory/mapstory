from django.contrib.auth import authenticate, get_user_model
from django.urls import reverse
from django.test import Client
from django.test.client import RequestFactory
from django.test.utils import override_settings

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

from .views import profile_edit

User = get_user_model()


def getTestUser():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User
    """
    try:
        return User.objects.get(username='profiletester')
    except User.DoesNotExist:
        return User.objects.create_user(username='profiletester',
                                        email='profiletester@mapstorytests.com',
                                        password='superduperpassword2000')


class TestSignupView(MapStoryTestMixin):
    def test_uses_template(self):
        response = self.client.get(reverse('account_signup'))
        self.assertTemplateUsed(response, 'site_base.html')

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_sign_up_renders(self):
        """
        Ensure the sign up page returns a 200.
        """
        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        self.assertHasGoogleAnalytics(response)

    @override_settings(GOOGLE_ANALYTICS='testing')
    def test_sign_up(self):
        """
        Ensure the signup works.
        """

        c = Client()
        response = c.get(reverse('account_signup'))
        self.assertEqual(response.status_code, 200)
        data = dict(username='test', first_name='test12345', last_name='user', email='test@example.com', password='test123456', password1='test123456',
                    password2='test123456')

        response = c.post(reverse('account_signup'), data=data, follow=True)
        self.assertEqual(response.status_code, 200)
        # self.assertEqual(len(mail.outbox), 1)
        self.assertHasGoogleAnalytics(response)

        # make sure the custom subject template is being used
        # self.assertEqual(mail.outbox[0].subject, 'Account activation on MapStory')
        # conf = EmailConfirmation.objects.first()
        # self.assertTrue(conf.key in mail.outbox[0].body)

        # response = c.get(reverse('account_confirm_email', args=[conf.key]))
        # self.assertEqual(response.status_code, 200)
        # self.assertHasGoogleAnalytics(response)

        user = authenticate(**data)
        self.assertTrue(user)
        self.assertEqual(user.username, data['username'])
        self.assertEqual(user.name_long, data['first_name'] +
                         ' ' + data['last_name'] + ' (' + data['username'] + ')')
        self.assertEqual(user.first_name, data['first_name'])
        self.assertEqual(user.last_name, data['last_name'])
        self.assertEqual(user.email, data['email'])

        # response = c.post(reverse('account_confirm_email', args=[conf.key]))
        # self.assertEqual(response.status_code, 302)
        # self.assertEqual(len(mail.outbox), 2)
        # self.assertHasGoogleAnalytics(response)

        # make sure the custom subject and welcome template is being used
        # self.assertEqual(mail.outbox[1].subject, "Welcome to MapStory!")
        # Regardless of email content used, ensure it personally addresses the user
        # self.assertTrue(user.username in mail.outbox[1].body or user.first_name in mail.outbox[1].body)


class ProfileDetailViewTest(MapStoryTestMixin):
    def setUp(self):
        self.test_username, self.test_password = self.create_user(
            'testingProfiles', 'testingProfiles')
        self.userclient = AdminClient()

    def tearDown(self):
        pass

    def test_profile_detail_not_found(self):
        # Should build detail URL correctly
        self.assertEqual(reverse('profile_detail', kwargs={
                         'slug': 'nonexistent'}), '/storyteller/nonexistent/')
        # Should not find this user
        response = self.client.get(
            reverse('profile_detail', kwargs={'slug': 'nonexistent'}))
        self.assertEqual(response.status_code, 404)

    def test_page_detail_page_response(self):
        # We need an existing user for this
        testUser = getTestUser()
        response = self.client.get(testUser.get_absolute_url())

        # The profile page should exist
        self.assertEqual(response.status_code, 200)

        # Should be using the correct template
        self.assertTemplateUsed(response, 'people/profile_detail.html')
        self.assertContains(response, testUser.first_name)

    def test_get_username_none(self):
        response = self.client.get(reverse('profile_edit', kwargs={
                                   'username': None}), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_profile_edit_page_responses(self):
        otherUser = getTestUser()
        other_url = reverse('profile_edit', kwargs={
                            'username': otherUser.username})
        self.assertEqual(other_url, '/storyteller/edit/%s/' %
                         otherUser.username)

        # Anonymous users should be redirected to login form
        response = self.client.get(other_url, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'account/login.html')
        self.assertContains(response, 'Log in to an existing account')

        # Login with a user
        edit_user_url = reverse('profile_edit', kwargs={
                                'username': self.test_username})
        self.userclient.login_as_non_admin(
            username=self.test_username, password=self.test_password)
        response = self.userclient.get(edit_user_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.test_username)
        self.assertTemplateUsed(response, 'people/profile_edit.html')
        self.assertContains(response, 'Edit Your Profile')

        # Create new organization
        form_data = {
            'first_name': 'editedtestname',
            'last_name': 'editedtestname',
        }
        response = self.userclient.post(
            edit_user_url, data=form_data, follow=True)

        # Should not let other users edit profiles they don't own
        response = self.userclient.get(other_url)
        self.assertEqual(response.status_code, 403)

    def test_users_cannot_edit_other_users(self):
        factory = RequestFactory()
        request = factory.get('storyteller/edit/admin')
        testUser = getTestUser()
        request.user = testUser
        request.session = {}
        response = profile_edit(request, None)

        # Server should refuse!
        self.assertEqual(response.status_code, 403)

    def test_profile_delete_anonymous_user_delete(self):
        # Should redirect to the login page
        response = self.client.get(reverse('profile_delete', kwargs={
                                   'username': 'nonexistentuser'}), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'account/login.html')

    def test_profile_delete_not_found(self):
        self.userclient.login_as_non_admin(
            username=self.test_username, password=self.test_password)
        response = self.userclient.get(reverse('profile_delete', kwargs={
                                       'username': 'nonexistentuser'}), follow=True)
        self.assertEqual(response.status_code, 404)

    def test_profile_delete_get(self):
        self.userclient.login_as_non_admin(
            username=self.test_username, password=self.test_password)
        response = self.userclient.get(reverse('profile_delete', kwargs={
                                       'username': self.test_username}), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'people/profile_delete.html')
