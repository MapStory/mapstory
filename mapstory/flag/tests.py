from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.test import Client

from geonode.base.models import TopicCategory
from geonode.layers.models import Layer
from mapstory.mapstories.models import Map
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.populate_test_data import create_models

from .models import FlaggedContent

User = get_user_model()


class AdminClient(Client):
    def login_as_admin(self, username='admin', password='admin'):
        """
        Convenience method to login admin.
        """
        return self.login(**{'username': username, 'password': password})

    def login_as_non_admin(self, username='non_admin', password='non_admin'):
        """
        Convenience method to login a non-admin.
        """
        return self.login(**{'username': username, 'password': password})


class FlagsTest(MapStoryTestMixin):
    def setUp(self):

        create_models(model_type='layer')

    def test_flag_view(self):
        """
        Tests the flag view.
        """
        layer = Layer.objects.first()
        ct = ContentType.objects.get_for_model(layer)
        c = AdminClient()
        response = c.get(reverse('flag'))
        self.assertLoginRequired(response)

        c.login_as_admin()
        response = c.get(reverse('flag'))
        self.assertEqual(response.status_code, 405)

        data = dict(content_type=ct.id, object_id=layer.id,
                    comment="what is this?", creator_field='owner')

        response = c.post(reverse('flag'), data=data)
        self.assertEqual(response.status_code, 302)

        flag = FlaggedContent.objects.first()
        self.assertEqual(flag.content_type, ct)
        self.assertEqual(flag.object_id, data['object_id'])
        self.assertEqual(
            flag.flaginstance_set.first().comment, data['comment'])
        self.assertEqual(flag.flaginstance_set.first().user,
                         User.objects.get(username='admin'))
