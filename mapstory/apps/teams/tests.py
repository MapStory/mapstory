from django.test import TestCase
from django.core.urlresolvers import reverse

from tastypie.test import ResourceTestCaseMixin

from mapstory.apps.organizations.models import Organization
from mapstory.apps.initiatives.models import Initiative
from mapstory.tests.utils import get_test_user, create_mapstory, create_layer, create_user
from .models import Team


class TeamTests(ResourceTestCaseMixin, TestCase):
    api_url = '/teams/api/team/'

    def setUp(self):
        super(TeamTests, self).setUp()
        self.username = 'modeltester'
        self.password = 'glassonion232123'
        self.user = get_test_user()

    def tearDown(self):
        self.user = None
        self.team = None

    def get_credentials(self):
        return self.create_basic(username=self.username, password=self.password)

    def test_get_list_unauthenticated(self):
        # Should be available without logging in.
        self.assertHttpOK(self.api_client.get(self.api_url, format='json'))

    def test_name_query(self):
        org = Organization.objects.create(name='test', slogan='123', about='456')
        ini = Initiative.objects.create(
            name='Testing Initiative', about='Testing 123', slogan='The test is strong with this one'
        )
        response = self.client.get('/search/?groups&limit=30&offset=0&q=test')
        self.assertEqual(200, response.status_code)
        self.assertContains(response, 'test')

    def test_polymorphic_teams(self):
        team = Organization.objects.create(
            name='Testing Team', about='About this team', slogan='Testing teams team'
        )
        Organization.objects.create(
            name='Testing Team2', about='About this team2', slogan='Testing teams team2'
        )
        Initiative.objects.create(
            name='Testing Initiative', about='Testing 123', slogan='The test is strong with this one'
        )
        Initiative.objects.create(
            name='Testing Initiative', about='Testing 123', slogan='The test is strong with this one'
        )
        resp = self.api_client.get(self.api_url, format='json', authentication=self.get_credentials())
        self.assertValidJSONResponse(resp)

        # Should have 2 Organizations and 2 Initaitives:
        self.assertEqual(len(self.deserialize(resp)['objects']), 4)

        # Here, we're checking an entire structure for the expected data.
        self.assertContains(resp, team.name)
        self.assertContains(resp, team.slogan)
        self.assertContains(resp, team.about)

    def test_team_name_filter(self):
        team = Team.objects.create(
            name='TestingTeam', about='About this team', slogan='Testing teams team'
        )

        resp = self.api_client.get(self.api_url + '?name=TestingTeam', format='json')
        self.assertValidJSONResponse(resp)
        self.assertEqual(len(self.deserialize(resp)['objects']), 1)
        self.assertContains(resp, team.name)
        self.assertContains(resp, team.about)
