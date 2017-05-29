
from django.test import Client
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from mapstory.export import export_via_model
from ..MapStoryTestMixin import MapStoryTestMixin

User = get_user_model()


class MapStoryAdminTests(MapStoryTestMixin):

    def test_csv_user_export(self):
        """
        Ensure export model returns a csv file
        """
        c = Client()
        request = c.get(reverse('index_view'))
        response = export_via_model(User, request, User.objects.all(), exclude=['password'])
        self.assertEqual(response['Content-Type'], 'text/csv')
