from unittest import skip

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.test import TestCase

from ...tests.MapStoryTestMixin import MapStoryTestMixin
from ...tests.AdminClient import AdminClient
from ...utils import parse_schema, error_response, Link
from mapstory.tests import utils
from geonode.maps.models import Layer


class TestUtils(MapStoryTestMixin):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_error_response(self):
        status_code = 111,
        text = "Test error 111"

        error = error_response(status_code, text)
        self.assertIsInstance(error, HttpResponse)
        self.assertEqual(error.status_code, status_code)

    def test_create_layer(self):
        """
        Tests the layer creation helper method
        """
        owner = utils.get_test_user()
        initial_count = Layer.objects.all().count()
        layer = utils.create_layer("Test title", "A descriptiion", owner)
        final_count = Layer.objects.all().count()
        self.assertEqual(final_count, initial_count + 1)
        self.assertIsInstance(layer, Layer)
        self.assertEqual(layer.owner_id, owner.id)
        self.assertEqual(layer.title, "Test title")


class TestLinkUtil(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_link(self):
        url = "https://josellausas.com"
        name = "Blog"
        link = Link(url, name)
        self.assertIsInstance(link, Link)
        self.assertEqual(link.name, name)
        self.assertEqual(link.render(), '<a target="_" href="%s">%s</a>' % (url, name))
        self.assertFalse(link.is_image())

    def test_image_link(self):
        image_url = "http://tierranuestra.es/blog/wp-content/uploads/2014/12/image-4434489.jpg"
        name = "An Image Of Queso"
        link = Link(image_url, name)
        self.assertTrue(link.is_image())
        self.assertEqual(link.render(), '<img class="None" src="%s" title="%s"></img>' % (image_url, name))
        self.assertEqual(link.name, name)

    def test_facebook_link(self):
        fb_url = "https://www.facebook.com/RaspberryPiPuebla"
        name = "Raspberry Pi Puebla"
        link = Link(fb_url, name)
        self.assertEqual(link.render(), '<a target="_" href="%s"><img src="/static/img/facebook.png" border=0></a>' % (fb_url,))

    def test_youtube_link(self):
        video_id = "8np2I_gQgcY"
        video_link = "https://youtu.be/%s" % (video_id,)
        name = "Video000000000"
        link = Link(video_link, name)
        self.assertTrue(video_id in link.render())
        self.assertEqual(name, link.name)
