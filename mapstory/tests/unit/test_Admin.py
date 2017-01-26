from django.contrib.admin.sites import AdminSite
from django.test import TestCase

from mapstory.admin import (
    GetPageAdmin, 
    GetPageChoiceField, 
    GetPageContentForm, 
    GetPageContentAdmin, 
    SponsorAdmin, 
    TaskInline, 
    CommunityAdmin, 
    NewsItemForm, 
    LeaderAdmin, 
    ParallaxImageAdmin, 
    CustomSiteAdmin,
)
from mapstory.journal.admin import JournalEntryAdmin
from mapstory.models import GetPage, GetPageContent


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

    def test_get_page_content_admin(self):
        getPageContentAdmin = GetPageContentAdmin(self.getPageContent, self.site)
        self.assertIsNotNone(getPageContentAdmin)
        self.assertIsInstance(getPageContentAdmin, GetPageContentAdmin)
