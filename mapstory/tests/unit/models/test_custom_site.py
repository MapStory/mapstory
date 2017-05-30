import tempfile

from unittest import skip

from django.test import TestCase

from mapstory.models import CustomSite, Site


class TestCustomSite(TestCase):
    """
    CustomSite model testing
    """
    def setUp(self):
        testImage = tempfile.NamedTemporaryFile(suffix=".jpg").name
        self.customSite = CustomSite()
        self.assertIsInstance(self.customSite, CustomSite, "Should create a new site")
        self.customSite.logo = testImage
        self.customSite.favicon = testImage
        self.customSite.subtitle = 'subtitle'
        self.customSite.footer_text = 'footer text'
        testSite = Site()
        testSite.save()
        self.customSite.site = testSite

    def test_import(self):
        """
        Should import CustomSite
        """
        self.assertIsNotNone(CustomSite, 'Should import CustomSite')

    def test_save_and_retrieve(self):
        """
        Should save and retrieve the same object
        """
        self.assertEqual(CustomSite.objects.all().count(), 0, 'Should be empty')
        self.customSite.save()
        # Get the saved items
        saved_items = CustomSite.objects.all()
        self.assertEqual(saved_items.count(), 1, 'Should increment the save count')
        savedSite = saved_items[0]
        self.assertEqual(savedSite.subtitle, 'subtitle', 'Should have same subtitle')
        self.assertEqual(savedSite.footer_text, 'footer text', 'Should have same footer text')
        self.assertIsInstance(savedSite.site, Site, 'Should be instance of Site')

    def test_metadata(self):
        """
        Metadata tests
        """
        self.assertEqual(CustomSite._meta.verbose_name.title(), "Custom Site Property")
        self.assertEqual(CustomSite._meta.verbose_name_plural,"Custom Site Properties")

    @skip("TODO: Set the domain for the site")
    def test_unicode(self):
        """
        Unicode method tests
        """
        self.assertIsNotNone(unicode(self.customSite), "Should have unicode representation")
