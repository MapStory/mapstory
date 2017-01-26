'''
from django.core.urlresolvers import reverse
from geonode.groups.models import GroupProfile, GroupMember
from django.contrib.auth import get_user_model

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

User = get_user_model()


def addUserAsManagerToGroup(user,group):
    group.join(user, role="manager")


def getTestUser():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User 
    """
    allUsers = User.objects.all()
    if len(allUsers) > 0 :
        return allUsers[0]
    else :
        return User.objects.create_user(username='profiletester',
                                 email='profiletester@mapstorytests.com',
                                 password='superduperpassword2000')


def getTestInitiative():
    groups = GroupProfile.objects.all()
    if len(groups) > 0 :
        for g in groups:
            if(g.profile_type == 'ini'):
                return g

        return GroupProfile.objects.create(description='Test Initiative', slug='testinitiative', title='Test', profile_type='ini')
    else :
        return GroupProfile.objects.create(description='Test Initiative', slug='testinitiative', title='Test', profile_type='ini')

class TestInitiativesView(MapStoryTestMixin):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_initiatives_edit_view(self):
        response = self.client.get(reverse('initiative_edit', kwargs={'slug':'unknown slug'}))
        self.assertContains(response, )
'''
