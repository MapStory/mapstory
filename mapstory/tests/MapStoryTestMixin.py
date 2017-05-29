from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class MapStoryTestMixin(TestCase):
    def assertLoginRequired(self, response):
        self.assertEqual(response.status_code, 302)
        self.assertTrue('login' in response.url)

    def assertHasGoogleAnalytics(self, response):
        """
        Make sure you have a non empty string for google analytics inside your `local_settings.py`

        :param response: Test response
        """
        self.assertTrue('mapstory/_google_analytics.html' in [t.name for t in response.templates])

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = User.objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password
