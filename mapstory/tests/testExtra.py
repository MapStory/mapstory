"""
Mapstory extra tests
====================

Contains sample tests and extras.

WIP
"""
from django.test import TestCase, Client
from django.core.urlresolvers import reverse, resolve
from django.contrib.admin.sites import AdminSite
from unittest import skip
from mapstory import __version__ as version
from ..admin import GetPageAdmin, GetPageChoiceField, GetPageContentForm, GetPageContentAdmin, SponsorAdmin, TaskInline, CommunityAdmin, NewsItemForm, LeaderAdmin, ParallaxImageAdmin, CustomSiteAdmin
from ..models import GetPage, GetPageContent
from ..views import IndexView
from ..version import get_version
from mapstory.journal.admin import JournalEntryAdmin


class MockRequest(object):
    """
    A mock request
    """
    pass

class MockSuperUser(object):
    """
    A mock superuser
    """
    def has_perm(self, perm):
        return True

request = MockRequest()

class TestHomeView(TestCase):
    def test_home_response(self):
        """
        Should get a response for index_view
        """
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)

    def test_get_context_data(self):
        """
        Should return a valid context
        """
        i = IndexView()
        context = i.get_context_data()
        self.assertIsNotNone(context, "Context should not be None")
        self.assertIsNotNone(context['sponsors'], "Sponsors was None")
        self.assertIsNotNone(context['communities'], "Communities was None")
        self.assertIsNotNone(context['news_items'], "News items was none")
        self.assertIsNotNone(context['images'], "Images was none")
        self.assertIsNotNone(context['journal_entries'], "Journal entries was none")

    def test_journal_list_view(self):
        c = Client()
        response = c.get(reverse('journal'))
        self.assertEqual(response.status_code, 200)




class TestVersion(TestCase):
    def test_did_import(self):
        self.assertIsNotNone(get_version)

    def test_get_version(self):
        self.assertIsNotNone(get_version(None))
        self.assertEqual(get_version(), "1.0c0")
        self.assertEqual(get_version(version=version), "1.0c0")


class TestAdmin(TestCase):
    def setUp(self):
        self.site = AdminSite()

        # GetPage for testing
        self.getPage = GetPage.objects.create(name='Test name',title='Test title',subtitle='Test subtitle',)
        self.assertIsInstance(self.getPage, GetPage)

        # Page content for testing
        self.getPageContent = GetPageContent(title='Test title', main_link='#', page=self.getPage)
        self.assertIsInstance(self.getPageContent, GetPageContent)

    def test_did_import(self):
        self.assertIsNotNone(GetPageAdmin)
        self.assertIsNotNone(GetPageChoiceField)
        self.assertIsNotNone(GetPageContentForm)
        self.assertIsNotNone(GetPageContentAdmin)
        self.assertIsNotNone(SponsorAdmin)
        self.assertIsNotNone(TaskInline)
        self.assertIsNotNone(CommunityAdmin)
        self.assertIsNotNone(NewsItemForm)
        self.assertIsNotNone(JournalEntryAdmin)
        self.assertIsNotNone(LeaderAdmin)
        self.assertIsNotNone(ParallaxImageAdmin)
        self.assertIsNotNone(CustomSiteAdmin)

    def test_get_page_admin(self):
        # Test the constructor
        pageAdmin = GetPageAdmin(self.getPage, self.site)
        self.assertIsNotNone(pageAdmin)
        self.assertIsInstance(pageAdmin, GetPageAdmin)
        # self.assertEqual(list(pageAdmin.get_form(request).base_fields), ['name', 'title', 'subtitle'])

    def test_get_page_content_admin(self):
        getPageContentAdmin = GetPageContentAdmin(self.getPageContent, self.site)
        self.assertIsNotNone(getPageContentAdmin)
        self.assertIsInstance(getPageContentAdmin, GetPageContentAdmin)
        # form = getPageContentAdmin.get_form(request)
        # self.assertIsNotNone(form)
        # self.assertEqual(list(getPageContentAdmin.get_form(request).base_fields), ['subtitle', 'order', 'publish'])

    def test_index_template_used(self):
        c = Client()
        response = c.get(reverse('index_view'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "index.html")

