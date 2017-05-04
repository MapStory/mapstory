from datetime import datetime

from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

from geonode.groups.models import GroupProfile, GroupMember
from mapstory.apps.collections.models import Collection

from ...AdminClient import AdminClient
from ...MapStoryTestMixin import MapStoryTestMixin

User = get_user_model()

class TestInitiativesViews(MapStoryTestMixin):
    def setUp(self):
        # Create admin and login
        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.admin = AdminClient()
        self.admin.login_as_admin()


    def get_initiative(self):
        groups = GroupProfile.objects.all()
        if len(groups) < 1:
            self.create_initiative()

        groups = GroupProfile.objects.all()
        if len(groups) < 1:
            raise RuntimeError

        for g in groups:
            if (g.profile_type == 'ini'):
                return g

    def addUserAsManagerToGroup(user, group):
        group.join(user, role="manager")





    def create_initiative(self, form_data=None):
        """
        Helper method for creating an initiave via a POST request

        :param form_data: (Optional) Payload for the POST request

        :return: HttpResponse The http response
        """
        data = form_data or {
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
        response = self.admin.post(reverse('initiative_create'), data=data, follow=True)
        return response

    def test_initiative_create(self):
        current_count = len(GroupProfile.objects.all())

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
        # Should respond OK
        response = self.create_initiative(form_data)
        self.assertEqual(response.status_code, 200)
        self.assertRedirects(response, '/initiatives/' + form_data['slug'], status_code=302, target_status_code=200)

        # Count should have changed
        self.assertEquals(current_count + 1, len(GroupProfile.objects.all()))
        group = GroupProfile.objects.all().first()
        collection = Collection.objects.all().first()
        self.assertEqual(collection.group, group)

        # Should use the correct template
        self.assertTemplateUsed(response, 'groups/initiative_detail.html')
        self.assertTemplateNotUsed(response, 'account/login.html')

    def test_initiative_edit_get(self):
        initiative = self.get_initiative()
        self.assertIsNotNone(initiative)

        response = self.admin.get(reverse('initiative_edit',  kwargs={'slug': initiative.slug}))
        self.assertEquals(200, response.status_code)
        self.assertTemplateNotUsed(response, 'account/login.html')
        self.assertTemplateUsed(response, 'groups/group_update.html')

    def test_initiative_edit_post(self):
        initiative = self.get_initiative()
        initial_count = len(GroupProfile.objects.all())
        form_data = {
            'description': 'Edited description here',
        }

        response = self.admin.post(
            reverse('initiative_edit', kwargs={'slug': initiative.slug}),
            data = form_data,
            follow = True
        )

        self.assertEquals(200, response.status_code)
        self.assertTemplateUsed(response, 'groups/group_update.html')

        edited_initiative = GroupProfile.objects.get(id=initiative.id)
        self.assertIsNotNone(edited_initiative)

        #@FIXME: This is not doing the right thing
        # self.assertEquals(edited_initiative.description, form_data['description'])

        # Count should remain the same
        self.assertEquals(initial_count, len(GroupProfile.objects.all()))

    def test_initiatives_members(self):
        initiative = self.get_initiative()

        response = self.admin.get(reverse('initiative_members', kwargs={'slug': initiative.slug}))
        self.assertEquals(response.status_code, 200)
        self.assertContains(response, initiative.title)

    def test_initiatives_members_add(self):
        pass

    def test_initiative_member_remove(self):
        pass
