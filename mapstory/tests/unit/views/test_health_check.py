from django.core.urlresolvers import reverse

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.AdminClient import AdminClient


class HealthCheckViewTest(MapStoryTestMixin):
    def setUp(self):
        self.test_username, self.test_password = self.create_user('testHealthCheck', 'testHealthCheck')
        self.userclient = AdminClient()
    
    def tearDown(self):
        pass
    
    def test_responses(self):
        self.userclient.login_as_non_admin(username=self.test_username, password=self.test_password)
        response = self.userclient.get(reverse('health_check'))
        self.assertTemplateUsed(response, 'health_check/dashboard.html')


