from django.core.urlresolvers import reverse
from django.contrib.contenttypes.models import ContentType
from django.test import Client
from django.contrib.auth import get_user_model
from geonode.base.models import TopicCategory
from mapstory.tests.populate_test_data import create_models
from mapstory.mapstories.models import Map
from .models import FlaggedContent
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

User = get_user_model()

# @TODO Replace this with something better that doesn't specify a username and password.
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

        create_models(type='map')

    def test_flag_view(self):
        """
        Tests the flag view.
        """
        m = Map.objects.first()
        ct = ContentType.objects.get_for_model(m)
        c = AdminClient()
        response = c.get(reverse('flag'))
        self.assertLoginRequired(response)

        c.login_as_admin()
        response = c.get(reverse('flag'))
        self.assertEqual(response.status_code, 405)

        data = dict(content_type=ct.id, object_id=m.id, comment="what is this?", creator_field='owner')

        response = c.post(reverse('flag'), data=data)
        self.assertEqual(response.status_code, 302)

        flag = FlaggedContent.objects.first()
        self.assertEqual(flag.content_type, ct)
        self.assertEqual(flag.object_id, data['object_id'])
        self.assertEqual(flag.flaginstance_set.first().comment, data['comment'])
        self.assertEqual(flag.flaginstance_set.first().user, User.objects.get(username='admin'))

