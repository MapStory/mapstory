from unittest import skip

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin


class HealthCheckViewTest(MapStoryTestMixin):

    def setUp(self):
        self.test_username, self.test_password = self.create_user('testHealthCheck', 'testHealthCheck')
        self.userclient = AdminClient()

    def tearDown(self):
        pass

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = get_user_model().objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password

    @skip("This works locally. Skipping until geoserver works.")
    def test_template(self):
        self.create_user(username='test_admin', password='test_admin', is_superuser=True)
        self.userclient.login_as_non_admin('test_admin', 'test_admin')
        response = self.userclient.get(reverse('health_check'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'health_check/dashboard.html')
        #TODO(Zunware): Assert that health check is passing
