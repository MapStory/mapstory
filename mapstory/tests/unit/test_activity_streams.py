from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.utils.translation import ugettext as _
from django.conf import settings

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.utils import create_test_layers


class ActivityStreamTest(TestCase):


    def setUp(self):
        pass


    def test_actstream_settings_overwrite(self):
        ACTSTREAM_SETTINGS = getattr(settings, "ACTSTREAM_SETTINGS", None)
        self.assertIsNotNone(ACTSTREAM_SETTINGS)
        self.assertEqual(ACTSTREAM_SETTINGS['MAPSTORY_CUSTOM'], 'payload')


    def test_activity_stream_geonode(self):
        pass



class SocialTests(MapStoryTestMixin):
    """
    Tests for Social Activity Streams
    """
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)


    def test_social_page_should_render(self):
        admin_client = AdminClient()
        admin_client.login_as_admin()
        response = admin_client.get(reverse('profile_detail', args=[self.username]))

        # Test for final status code = HTTP OK
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'people/profile_detail.html')

        # Should have all the tab names shown
        self.assertContains(response, 'Stories')
        self.assertContains(response, 'Layers')
        self.assertContains(response, 'Uploads')
        self.assertContains(response, 'Messages')
        self.assertContains(response, 'Activity Feed')
        self.assertContains(response, 'Journal Entries')
        self.assertContains(response, 'Favorites')
        self.assertContains(response, 'Icons')
        self.assertContains(response, 'Stories')

    def test_Map_actions_stream(self):
        # Check number of actions streams
        create_test_layers()








