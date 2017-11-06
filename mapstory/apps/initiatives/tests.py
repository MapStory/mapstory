from django.test import TestCase
from django.core.urlresolvers import reverse

from . import models


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


class TestInitiativesAPI(TestCase):
    """
    Initiative API tests.
    """
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

    def test_request_join(self):
        pass

