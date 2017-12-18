from django.test import TestCase
from django.core.urlresolvers import reverse

from mapstory.apps.organizations.models import Organization


class BaseGroupTests(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_api_urls(self):
        response = self.client.get('/teams/api/team', follow=True)
        self.assertEqual(200, response.status_code)

    def test_name_query(self):
        org = Organization.objects.create(name='test', slogan='123', about='456')
        response = self.client.get('/search/?groups&limit=30&offset=0&name=test')
        self.assertEqual(200, response.status_code)
        self.assertContains(response, 'test')
