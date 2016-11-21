from django.test import TestCase, Client
from unittest import skip
from django.core.urlresolvers import reverse, resolve
from django.contrib.admin.sites import AdminSite
from geonode.groups.models import GroupProfile
from django.contrib.sites.models import Site
from django.contrib.auth import get_user_model

from geonode.maps.models import Map
from geonode.maps.models import MapStory
from ..models import *
from ..models import _stamp
import tempfile

# Gets the custom mapstory user model
User = get_user_model()
testImage = tempfile.NamedTemporaryFile(suffix=".jpg")


class MockInstance(object):
    """
    Helper Mock Instance
    """
    name = 'A name'


def getTestUser():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User 
    """
    allUsers = User.objects.all()
    if allUsers.count() > 0 :
        return allUsers[0]
    else :
        return User.objects.create_user(username='modeltester',
                                 email='modeltester@models.com',
                                 password='glassonion232123')

# Get a user for testing
testUser = getTestUser()

class TestMapstoryModel(TestCase):
    """
    Mapstory Model Tests
    """
    def setUp(self):
        self.mapstory = MapStory()
        self.assertIsInstance(self.mapstory, MapStory, "Should be instance of MapStory")
        self.mapstory.title = "Test story"
        self.mapstory.owner = testUser
    
    def test_save_and_retrieve(self):
        """
        Should save in database
        """
        self.assertEqual(0, MapStory.objects.all().count())
        self.mapstory.save()
        self.assertEqual(1, MapStory.objects.all().count())
        savedMapStory = MapStory.objects.all()[0]
        self.assertEqual(savedMapStory.title, "Test story", "Should have the same title")
        self.assertEqual(savedMapStory.owner, self.mapstory.owner, "Should have the same owner")

    def test_remove(self):
        self.assertEqual(0, MapStory.objects.all().count())
        self.mapstory.save()
        self.assertEqual(1, MapStory.objects.all().count())
        MapStory.objects.filter(id=self.mapstory.id).delete()
        self.assertEqual(0, MapStory.objects.all().count())

    def test_get_abosolute_url(self):
        self.assertIsNotNone(self.mapstory.get_absolute_url())

    def test_update_from_viewer(self):
        conf = {}
        conf.title = "Test"
        conf.abstract = "Test abstract"
        conf.is_published = True
        self.mapstory.update_from_viewer(conf)

 
class TestHelperMethods(TestCase):
    """
    Model helper methods tests
    """
    def test_import(self):
        """
        All test methods should import
        """
        self.assertIsNotNone(_stamp)
        self.assertIsNotNone(name_post_save)
        self.assertIsNotNone(get_images)
        self.assertIsNotNone(get_sponsors)
        self.assertIsNotNone(get_featured_groups)
        self.assertIsNotNone(get_group_layers)
        self.assertIsNotNone(get_group_maps)
        self.assertIsNotNone(get_group_journals)
        self.assertIsNotNone(mapstory_profile_post_save)

    def test_stamp(self):
        """
        Should return a hash
        """
        self.assertIsNotNone(_stamp("Hola!"))
        self.assertEqual(_stamp("123"),_stamp("123"))
        self.assertNotEqual(_stamp("123"), _stamp("321"))

    def test_stamp_params(self):
        """
        Should only stamp strings or buffers
        """
        self.assertRaises(TypeError, _stamp, 123)

    def test_stamp_returns(self):
        """
        Should be 8 in length
        """
        self.assertEqual(len(_stamp("456")), 8)
        self.assertEqual(len(_stamp("45685739391")), 8)
        self.assertEqual(len(_stamp("")), 8)
        self.assertEqual(len(_stamp("AaaaaaaaaAAaaAAAAaaA")), 8)

    def test_name_post_save(self):
        """
        name_post_save() tests
        """
        name_post_save(MockInstance())

    def test_get_images(self):
        self.assertIsNotNone(get_images())
        # Should return an array
        self.assertIsNotNone(get_images().count())
        self.assertEqual(get_images().count(), 0)

    def test_get_sponsors(self):
        self.assertEqual(get_sponsors().count(), 0)

    def test_get_featured_groups(self):
        self.assertEqual(get_featured_groups().count(), 0)

    @skip("TODO")
    def test_group_layers(self):
        gp = GroupProfile()
        self.assertEqual(get_group_layers(gp).count(), 0)
    
    @skip("TODO")
    def test_group_maps(self):
        gp = GroupProfile()
        self.assertEqual(get_group_maps(gp).count(), 0)

    @skip("TODO")
    def test_group_journals(self):
        pass

    @skip("TODO")
    def test_mapstory_profile_post_save(self):
        pass

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

class TestContentMixin(TestCase):
    def setUp(self):
        self.contentMixin = ContentMixin(content="<a href=%s target='_'>")

    def test_import(self):
        self.assertIsNotNone(ContentMixin)

    @skip("Fix this")
    def test_save_and_retrieve(self):
        self.contentMixin.save()
        saved = ContentMixin.objects.all()
        self.assertEqual(saved.count, 1)

    def test_html(self):
        self.assertTrue(self.contentMixin.html().strip().startswith("<"))
        self.assertTrue(self.contentMixin.html().endswith(">"))


class TestCommunity(TestCase):
    """
    Community model tests
    """
    def setUp(self):
        self.community = Community(name="Testing 1", icon=testImage)
        self.assertIsInstance(self.community, Community)

    def test_import(self):
        self.assertIsNotNone(Community)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.community))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass

    @skip("TODO")
    def test_url(self):
        pass

    @skip("TODO")
    def test_image_tag(self):
        pass


class TestTask(TestCase):
    """
    Task model tests
    """
    def setUp(self):
        self.task = Task()

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.task))

    @skip("TODO")
    def test_save_and_retrieve(self):
        self.task.save()


class TestNewsItem(TestCase):
    """
    NewsItem model tests
    """
    def setUp(self):
        self.newsItem = NewsItem()
        self.newsItem.item = "Test Item"
        self.assertIsInstance(self.newsItem, NewsItem)

    def test_import(self):
        self.assertIsNotNone(NewsItem)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.newsItem))

    @skip("TODO")
    def test_save_and_retrieve(self):
        self.newsItem.save()

    @skip("TODO")
    def test_publication_time(self):
        self.assertIsNotNone(self.newsItem.publication_time())


class TestGetPage(TestCase):
    """
    GetPage model tests
    """
    def setUp(self):
        self.getPage = GetPage()
        self.assertIsInstance(self.getPage, GetPage)

    def test_import(self):
        self.assertIsNotNone(GetPage)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.getPage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        self.getPage.save()


class TestGetPageContent(TestCase):
    """
    GetPageContent model tests
    """
    def setUp(self):
        self.getPageContent = GetPageContent()
        self.assertIsInstance(self.getPageContent, GetPageContent)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.getPageContent))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass


class TestLeader(TestCase):
    """
    Leader model tests
    """
    def setUp(self):
        self.leader = Leader()
        self.assertIsInstance(self.leader, Leader)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.leader))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass


class TestParallaxImage(TestCase):
    """
    ParallaxImage model tests
    """
    def setUp(self):
        self.parallaxImage = ParallaxImage()
        self.assertIsInstance(self.parallaxImage, ParallaxImage)

    @skip("TODO")
    def test_unicode(self):
        self.assertIsNotNone(unicode(self.parallaxImage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass

class TestThumbnailImage(TestCase):
    """
    Thumbnail Image model tests
    """
    def setUp(self):
        self.thumbnailImage = ThumbnailImage()
        self.assertIsInstance(self.thumbnailImage, ThumbnailImage)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.thumbnailImage))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass

class TestThumbnailImageForm(TestCase):
    """
    ThumbnailImageForm model tests
    """
    def setUp(self):
        self.tif = ThumbnailImageForm()
        self.assertIsInstance(self.tif, ThumbnailImageForm)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.tif))

    @skip("TODO")
    def test_save_and_retrieve(self):
        pass
