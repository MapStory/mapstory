import datetime
import json
from django.test import Client
from unittest import skip
from geonode.base.models import TopicCategory
from geonode.base.populate_test_data import create_models
from geonode.maps.models import Map
from django.core.urlresolvers import reverse
from .forms import StoryBoxForm
from .utils import parse_date_time, datetime_to_seconds, make_point
from .models import StoryBox
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from django.test import TestCase
from mapstory.apps.boxes.views import boxes

# @TODO Replace this with something better that doesn't specify a username and password.
class AdminClient(Client):
    def login_as_admin(self, username='admin', password='admin'):
        """
        Convenience method to login admin.
        """
        return self.login(**{'username': username, 'password': password})

    def login_as_non_admin(self, username='non_admin', password='non_admin'):
        """
        Convenience method to login a non-admin.
        """
        return self.login(**{'username': username, 'password': password})


class MapStoryTestsWorkFlowTests(MapStoryTestMixin):

    def setUp(self):
        # these are needed for the geonode fixtures
        TopicCategory.objects.create(identifier='biota')
        TopicCategory.objects.create(identifier='location')
        TopicCategory.objects.create(identifier='elevation')

        create_models(type='map')

    def test_box_form(self):
        data = {}
        m = Map.objects.first()
        form = StoryBoxForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertTrue('map' in form.errors.keys())
        self.assertTrue('title' in form.errors.keys())

        data['map'] = m.id
        data['title'] = 'this is a test'

        form = StoryBoxForm(data=data)
        self.assertTrue(form.is_valid())

        data['geometry'] = make_point(-77.464599609375, 37.61423141542417)

        form = StoryBoxForm(data=data)
        self.assertTrue(form.is_valid())

    def test_box_form_parse_float(self):
        """
        Tests the parse float method on the box form.
        """
        form = StoryBoxForm(data={'test': '1234.234'})
        self.assertEqual(form.parse_float('test'), 1234.234)

        self.assertIsNone(form.parse_float('nope'))

        # ensure value errors get added to the form.errors dict
        form = StoryBoxForm(data={'lat': 'nope'})
        form.full_clean()
        self.assertTrue('lat' in form.errors)

    def test_parse_date_time(self):
        """
        Tests the parse date time function.
        """

        self.assertIsNone(parse_date_time(None))

        with self.assertRaises(ValueError):
            self.assertIsNone(parse_date_time('-2015'))

        self.assertEqual(parse_date_time('2015/2'), datetime.datetime(2015, 2, 1, 0, 0))
        self.assertEqual(parse_date_time('2015/2/6'), datetime.datetime(2015, 2, 6, 0, 0))
        self.assertEqual(parse_date_time('2015/2/6T14'), datetime.datetime(2015, 2, 6, 14, 0))
        self.assertEqual(parse_date_time('2015/2/6 14'), datetime.datetime(2015, 2, 6, 14, 0))
        self.assertEqual(parse_date_time('2015/2/6T14:59'), datetime.datetime(2015, 2, 6, 14, 59))
        self.assertEqual(parse_date_time('2015/2/6 14:59'), datetime.datetime(2015, 2, 6, 14, 59))
        self.assertEqual(parse_date_time('2015/2/6T14:59:59'), datetime.datetime(2015, 2, 6, 14, 59, 59))
        self.assertEqual(parse_date_time('2015/2/6 14:59:59'), datetime.datetime(2015, 2, 6, 14, 59, 59))

        self.assertEqual(parse_date_time('2015-2'), datetime.datetime(2015, 2, 1, 0, 0))
        self.assertEqual(parse_date_time('2015-2-6'), datetime.datetime(2015, 2, 6, 0, 0))
        self.assertEqual(parse_date_time('2015-2-6T14'), datetime.datetime(2015, 2, 6, 14, 0))
        self.assertEqual(parse_date_time('2015-2-6 14'), datetime.datetime(2015, 2, 6, 14, 0))
        self.assertEqual(parse_date_time('2015-2-6T14:59'), datetime.datetime(2015, 2, 6, 14, 59))
        self.assertEqual(parse_date_time('2015-2-6 14:59'), datetime.datetime(2015, 2, 6, 14, 59))
        self.assertEqual(parse_date_time('2015-2-6T14:59:59'), datetime.datetime(2015, 2, 6, 14, 59, 59))
        self.assertEqual(parse_date_time('2015-2-6 14:59:59'), datetime.datetime(2015, 2, 6, 14, 59, 59))

    def test_datetime_to_seconds(self):
        """
        Tests the datetime to seconds function.
        """

        self.assertEqual(datetime_to_seconds(datetime.datetime(2009, 10, 21, 0, 0)), 1256083200)

    @skip("TODO")
    def test_boxes_view(self):
        """
        Tests various methods of the boxes view.
        """

        m = Map.objects.first()

        c = AdminClient()
        response = c.get(reverse('boxes', args=[m.id]))
        self.assertEqual(response.status_code, 200)

        response = c.delete(reverse('boxes', args=[m.id]))
        self.assertEqual(response.status_code, 400)

        response = c.put(reverse('boxes', args=[m.id]))
        self.assertEqual(response.status_code, 400)

        data = dict(map=m.id, title='this is a test', geometry=make_point(-77.464599609375, 37.61423141542417))
        response = c.post(reverse('boxes', args=[m.id]), data=data)
        self.assertEqual(response.status_code, 403)

        # TODO: Test POST request with box payload
        c.login_as_admin()

        data = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"playback":3,"playbackRate":"seconds","interval":1,"intervalRate":"years","title":"Sample Title","description":"Sample Description","start_time":946684800,"end_time":1577836800,"zoom":6,"center":[1766040.0266747456,729122.1624405942],"range":{"start":946684800000,"end":1577836800000},"speed":{"interval":31536000000,"seconds":3},"_offset":0,"_id":1444749022177}}]}

        response = c.post(reverse('boxes', args=[m.id]), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

        box = StoryBox.objects.first()
        feature = data['features'][0]
        self.assertEqual(box.map, m)
        self.assertEqual(box.title, feature['properties']['title'])
        self.assertEqual(box.playback, feature['properties']['playback'])
        self.assertEqual(box.playbackRate, feature['properties']['playbackRate'])
        self.assertEqual(box.interval, feature['properties']['interval'])
        self.assertEqual(box.intervalRate, feature['properties']['intervalRate'])
        self.assertEqual(box.description, feature['properties']['description'])
        self.assertEqual(box.start_time, feature['properties']['start_time'])
        self.assertEqual(box.end_time, feature['properties']['end_time'])
        self.assertEqual(box.zoom, feature['properties']['zoom'])
        self.assertEqual(eval(box.center), feature['properties']['center'])
        self.assertEqual(eval(box.speed), feature['properties']['speed'])



class BoxesViewUnitTests(TestCase):
    def test__boxes_get(self):
        self.assertIsNotNone(boxes)

    def test_boxes(self):
        try:
            boxes()
            self.fail("Expected an exception")
        except Exception as inst:
            self.assertEqual(inst.message, "boxes() takes exactly 2 arguments (0 given)")


        try:
            boxes({},{})
            self.fail("Expected an exception")
        except Exception as inst:
            self.assertIsNotNone(inst.message)


        # try:
        # except Exception as inst:
            # self.assertEqual(inst.message, "ContentType matching query does not exist.")



