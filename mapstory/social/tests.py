from actstream import registry
from actstream.models import Action, actor_stream
from dialogos.models import Comment

from geonode.maps.models import Map, MapStory, MapLayer, Layer

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse

from mapstory.social.templatetags.social_tags import activity_item
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

    def test_Map_actions_stream(self):
        # Check number of actions streams
        create_test_layers()

        # This is a chapter action
        action = Action.objects.all()[0]
        layer = action.action_object

        # The activity should read:
        # layer.owner (actor) 'uploaded' (verb) layer (object)
        self.assertEqual(action.actor, action.action_object.owner)
        self.assertEqual(action.data.get('raw_action'), 'created')
        # self.assertEqual(action.data.get('object_name'), layer.name)
        self.assertTrue(isinstance(action.action_object, Map))
        self.assertIsNone(action.target)

        # Test the  activity_item template tag
        template_tag = activity_item(Action.objects.all()[0])
        self.assertEqual(template_tag.get('username'), action.actor.username)
        # self.assertEqual(template_tag.get('object_name'), layer.name)
        self.assertEqual(template_tag.get('actor'), action.actor)
        self.assertEqual(template_tag.get('verb'), ('created'))
        self.assertEqual(template_tag.get('action'), action)
        self.assertEqual(template_tag.get('activity_class'), 'map')


        layer_name = "Chapter"
        layer.delete()

        # <user> deleted <object_name>
        action = Action.objects.all()[0]

        self.assertEqual(action.data.get('raw_action'), 'deleted')
        self.assertEqual(action.data.get('object_name'), layer_name)

        # objects are literally deleted so no action object or target should be related to a delete action.
        self.assertIsNone(action.action_object)
        self.assertIsNone(action.target)

        # Test the activity_item template tag
        action = Action.objects.all()[0]
        template_tag = activity_item(action)

        # Make sure the 'delete' class is returned
        self.assertEqual(template_tag.get('activity_class'), 'delete')

        # The layer's name should be returned
        self.assertEqual(template_tag.get('object_name'), layer_name)
        self.assertEqual(template_tag.get('verb'), _('deleted'))

        content_type = ContentType.objects.get_for_model(Layer)
        layer = Layer.objects.all()[0]
        comment = Comment(author=self.user,
                          content_type=content_type,
                          object_id=layer.id,
                          comment="This is a cool layer.")
        comment.save()

        action = Action.objects.all()[0]

        self.assertEqual(action.actor, self.user)
        self.assertEqual(action.data.get('raw_action'), 'created')
        self.assertEqual(action.action_object, comment)
        self.assertEqual(action.target, layer)

        template_tag = activity_item(action)

        # <user> added a comment on <target>
        self.assertEqual(template_tag.get('verb'), _('added a comment'))
        self.assertEqual(template_tag.get('activity_class'), 'comment')
        self.assertEqual(template_tag.get('target'), action.target)
        self.assertEqual(template_tag.get('preposition'), _('on'))
        self.assertIsNone(template_tag.get('object'))
        self.assertEqual(template_tag.get('target'), layer)

        # Pre-fecthing actstream breaks the actor stream
        self.assertIn(action, actor_stream(self.user))

