from django.test import Client

from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin

from django.core.urlresolvers import reverse


class TestGetStartedView(MapStoryTestMixin):
    def test_get_started_renders(self):
        """
        Ensure the get started view renders.
        """
        c = Client()
        response = c.get(reverse('getpage', args=['started']))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'mapstory/getpage.html')
        self.assertContains(response,'Get Started')
