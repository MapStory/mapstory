from django.core.urlresolvers import reverse
from django.test import Client

from .MapStoryTestMixin import MapStoryTestMixin


class ExtraMapstoryTests(MapStoryTestMixin):
    def setUp(self):
        pass

    def test_home(self):
        c = Client()
        response = c.get(reverse('index_view'))
        
        self.assertEqual(reverse('index_view'), u'/', 'Named url "index_view" should resolve to "/"') 
        self.assertEqual(response.template_name[0], 'index.html', 'Home should be using index.html template')



