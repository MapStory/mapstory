from actstream import registry, action
from actstream.models import Action, actor_stream
from dialogos.models import Comment

from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.conf import settings

from geonode.maps.models import Layer
from geonode.people.models import Profile

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.AdminClient import AdminClient
from mapstory.tests import utils as test_utils
from mapstory.tests.populate_test_data import create_models


class ActivityStreamTest(TestCase):

    def setUp(self):
        pass

    def test_actstream_settings_overwrite(self):
        ACTSTREAM_SETTINGS = getattr(settings, "ACTSTREAM_SETTINGS", None)
        self.assertIsNotNone(ACTSTREAM_SETTINGS)
        self.assertEqual(ACTSTREAM_SETTINGS['MAPSTORY_CUSTOM'], 'payload')
        site_id = getattr(settings, "SITE_ID", None)
        self.assertEqual(site_id, 1)


class SocialTests(MapStoryTestMixin):
    """
    Tests for Social Activity Streams
    """
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.user = get_user_model().objects.filter(username='admin')[0]

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
        # self.assertContains(response, 'Activity Feed')
        # self.assertContains(response, 'Journal Entries')
        # self.assertContains(response, 'Favorites')
        # self.assertContains(response, 'Icons')
        # self.assertContains(response, 'Stories')

    def test_user_actions_stream(self):
        # Register the things
        registry.register(Layer)
        registry.register(Comment)
        registry.register(Profile)

        # Should be empty
        actions = actor_stream(self.user)
        self.assertEqual(actions.count(), 0)

        # Create an action and check for updates.
        action.send(self.user, verb='reached level 10')
        admin_actions = actor_stream(self.user)
        self.assertEqual(admin_actions.count(), 1)

    def test_mapstory_create_triggers_action(self):
        """
        Test that layer creation triggers an action stream
        """
        # signals.post_save.connect(activity_post_modify_object, sender=Layer)
        actions_list = get_actions_for_model('layer')
        initial_action_count = actions_list.count()

        # Create a test layer here
        create_models(type='layer', user=self.user)

        actions_list = get_actions_for_model('layer')
        final_action_count = actions_list.count()
        self.assertTrue(initial_action_count < final_action_count)

    def test_layers_trigger_actions(self):
        actions_list = get_actions_for_model('layer')
        initial_action_count = actions_list.count()

        test_utils.create_layer('Test Layer', 'Abstract', self.user)

        actions_list = get_actions_for_model('layer')
        final_action_count = actions_list.count()
        self.assertTrue(initial_action_count < final_action_count)


def get_actions_for_model(model_name):
    """
    Helper function for getting actions for a model
    :param model_name: (string) The name of a model
    :return: (list) A list of actions for the given model
    """
    return Action.objects.filter(
        public=True,
        action_object_content_type__model=model_name
    )
