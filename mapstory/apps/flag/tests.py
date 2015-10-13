
from django.core.urlresolvers import reverse
from django.contrib.contenttypes.models import ContentType
from mapstory.tests import MapStoryTestMixin, AdminClient, User
from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from geonode.maps.models import Map
from .models import FlaggedContent


class FlagsTest(MapStoryTestMixin):

    def setUp(self):
        # these are needed for the geonode fixtures
        TopicCategory.objects.create(identifier='biota')
        TopicCategory.objects.create(identifier='location')
        TopicCategory.objects.create(identifier='elevation')

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

