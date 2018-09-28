from actstream import registry, action
from actstream.models import Action, actor_stream
from dialogos.models import Comment
from unittest import skip

from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.conf import settings

from geonode.maps.models import Layer
from geonode.people.models import Profile

from icon_commons.models import Icon
from icon_commons.models import Collection

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.AdminClient import AdminClient
from mapstory.tests import utils as test_utils
from mapstory.tests.populate_test_data import create_models


class ActivityStreamTest(TestCase):

    def setUp(self):
        pass

    def test_actstream_settings_overwrite(self):
        actstream_settings = getattr(settings, "ACTSTREAM_SETTINGS", None)
        self.assertIsNotNone(actstream_settings)
        site_id = getattr(settings, "SITE_ID", None)
        self.assertEqual(site_id, 1)


class SocialTests(MapStoryTestMixin):
    """
    Tests for Social Activity Streams
    """
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.user = get_user_model().objects.filter(username='admin')[0]

    def test_social_page_renders(self):
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

    def test_create_models_triggers_actions(self):
        """
        Test that layer creation triggers an action stream
        """
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

        # Should only trigger 1 action per mapstory
        self.assertTrue(initial_action_count < final_action_count)

    @skip("Implement this")
    def test_mapstory_actor_streams(self):
        action_list = get_actions_for_model('MapStory')
        initial_count = len(action_list)

        test_utils.create_mapstory(self.user, "Action Mapstory Test")
        final_count = len(action_list)

        # Action count should increase by one
        self.assertTrue(initial_count + 1, final_count)

        stream = actor_stream(self.user)
        self.assertEqual(len(stream), 1)
        self.assertEqual(self.user.id, stream[0].actor.id)

        test_utils.create_mapstory(self.user, "Action Mapstory Test 2")
        stream = actor_stream(self.user)
        self.assertEqual(len(stream), 2)

        # Create another actor and stream
        self.create_user('testactor', 'testactor1232432', is_superuser=False)
        other_user = get_user_model().objects.filter(username='testactor')[0]
        test_utils.create_mapstory(other_user, "Action Mapstory Test 3")
        other_stream = actor_stream(other_user)
        self.assertEqual(len(other_stream), 1)

        # The other actor's stream should not change
        same_stream = actor_stream(self.user)
        self.assertEqual(len(same_stream), 2)

        c = Collection.objects.create(name='default')
        icon = Icon.objects.create(collection=c, name='icon', owner=self.user)
        same_stream = actor_stream(self.user)
        self.assertEqual(len(same_stream), 3)

    def test_icon_upload_streams(self):
        initial_count = len(actor_stream(self.user))

        c = Collection.objects.create(name='default')
        icon = Icon.objects.create(collection=c, name='icon', owner=self.user)

        final_count = len(actor_stream(self.user))
        self.assertEqual(initial_count + 1, final_count)


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


def get_actions_for_actor(actor):
    """
    Returns a list of actions for the given actor
    :param actor: (User) The action actor
    :return: (Action[]) An array of acstream Actions
    """
    return actor_stream(actor)