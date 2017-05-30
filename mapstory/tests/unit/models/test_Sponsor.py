import tempfile

from unittest import skip

from django.test import TestCase

from mapstory.models import Sponsor, _stamp


class TestSponsor(TestCase):
    """
    Sponsor model tests
    """
    def setUp(self):
        tempdir = tempfile.mkdtemp(dir="/var/lib/mapstory/media")
        self.testImage = tempfile.NamedTemporaryFile(suffix=".jpg", dir=tempdir).name
        self.sponsor = Sponsor( name="Test", 
                                link="http://#", 
                                icon=self.testImage, 
                                description="Hola test", 
                                stamp=_stamp("teststamp") )
        self.assertIsNotNone(self.sponsor)
        self.assertIsInstance(self.sponsor, Sponsor)

    def test_import(self):
        """
        Model should import
        """
        self.assertIsNotNone(Sponsor)

    @skip("Fix this")
    def test_save_and_retrieve(self):
        """
        Should save and retrieve
        """
        self.assertEqual(Sponsor.objects.all().count(), 0, "should be empty")
        self.sponsor.save()
        saved = Sponsor.objects.all()
        self.assertEqual(saved.count(), 1)
        savedSponsor = saved[0]
        self.assertEqual(savedSponsor.name, "Test")
        self.assertEqual(savedSponsor.description, "Hola test")
        self.assertEqual(savedSponsor.link, "http://#")
        self.assertEqual(savedSponsor.description, "Hola test")
        self.assertIsNotNone(savedSponsor.icon, "should have an icon")
        self.assertEqual(savedSponsor.stamp, _stamp("teststamp"))

    def test_url(self):
        """
        Should return a valid url
        """
        url = self.sponsor.url()
        # self.assertTrue(url.startswith("file"))
        self.assertTrue(url.endswith(self.sponsor.stamp))

    def test_unicode(self):
        """
        Should return unicode
        """
        self.assertIsNotNone(unicode(self.sponsor))
        self.assertTrue(unicode(self.sponsor).endswith(self.sponsor.name))

    def test_image_tag(self):
        """
        Should build a valid image tag
        """
        self.assertTrue(self.sponsor.image_tag().startswith('<img src="'))
        self.assertTrue(self.sponsor.image_tag().endswith('" />'))

    def test_sponsor_name(self):
        sponsor = Sponsor(name='My Sponsor Name')
        self.assertEqual(unicode(sponsor), 'Sponsor - ' + sponsor.name)
