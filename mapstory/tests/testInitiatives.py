
from django.core.urlresolvers import reverse
from datetime import datetime
from geonode.groups.models import GroupProfile
from geonode.contrib.collections.models import Collection
from .MapStoryTestMixin import MapStoryTestMixin
from .AdminClient import AdminClient


class InitiativeTests(MapStoryTestMixin):
    def setUp(self):
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')

        admin = AdminClient()
        admin.login_as_admin()

        form_data = {
            'social_twitter': 'notreal',
            'social_facebook': 'notreal',
            'title': 'Test Initiative',
            'description': 'Testing',
            'email': 'test@test.com',
            'access': 'public',
            'date_joined': datetime.now(),
            'city': 'Victoria',
            'country': 'CAN',
            'keywords': 'test',
            'profile_type': 'org',
            'slug': 'Test-Initiative'
        }

        response = admin.post(reverse('initiative_create'), data=form_data, follow=True)
        self.assertEqual(response.status_code, 200)
        last_url, status_code = response.redirect_chain[-1]
        self.assertRedirects(response, '/initiatives/' + form_data['slug'], status_code=302, target_status_code=200)

        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)


    def test_access_permissions(self):
        print("Hello")

