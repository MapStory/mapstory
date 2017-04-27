from actstream import registry
from actstream.models import Action, actor_stream
from dialogos.models import Comment

from geonode.layers.models import Layer
from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

from mapstory.tests.helper import create_test_layers



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

    def test_MapLayer_actions_stream(self):
        # Check number of actions streams
        create_test_layers()
        # Check for updated action stream count

