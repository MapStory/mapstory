from django.test import TestCase
from django.core.urlresolvers import reverse


class BaseGroupTests(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_api_urls(self):
        response = self.client.get('/groupsapi/api/group', follow=True)
        self.assertEqual(200, response.status_code)
