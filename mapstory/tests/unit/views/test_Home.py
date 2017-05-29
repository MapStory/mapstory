from django.test import TestCase, Client
from django.core.urlresolvers import reverse, resolve

from mapstory.views import IndexView


class TestHomeView(TestCase):
    def test_home_responds_OK(self):
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)

    def test_url_root_resolve_uses_index_view(self):
        found = resolve("/")
        self.assertEqual(found.func.__name__, IndexView.__name__)

    def test_home_uses_correct_template(self):
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertTemplateUsed(response, "index.html")
        self.assertTemplateUsed(response, "site_base.html")

    def test_context_data(self):
        homeView = IndexView()
        context = homeView.get_context_data()
        self.assertIsNotNone(context, "Should have a context")
        self.assertIsNotNone(context['sponsors'], "Should have Sponsors context")
        self.assertIsNotNone(context['news_items'], "Should have news_items context")
        self.assertIsNotNone(context['images'], "Shoudl have Images context")
        self.assertIsNotNone(context['journal_entries'], "Should have Journal context")
