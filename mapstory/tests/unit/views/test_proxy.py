from mock import Mock, mock

from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import authenticate, login
from django.test.client import RequestFactory

from ...AdminClient import AdminClient
from ...MapStoryTestMixin import MapStoryTestMixin
from ....views import proxy

User = get_user_model()


class ProfileDetailViewTest(MapStoryTestMixin):

    def setUp(self):
        self.test_username, self.test_password = self.create_user('testingProfiles', 'testingProfiles')
        self.userclient = AdminClient()
        self.factory = RequestFactory()

    def tearDown(self):
        pass

    def test_proxy_view(self):
        request = self.factory.get('/')
        proxy(request)

    def test_proxy_url_get(self):
        request = self.factory.get('http://josellausas.com')
        proxy(request)

    # TODO(Zunware): proxy function needs more testing coverage
