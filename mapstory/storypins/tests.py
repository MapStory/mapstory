import json
import re
import tempfile

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import TransactionTestCase
from django.test.client import Client
from django.test.utils import override_settings

from mapstory.storypins.models import StoryPin
from mapstory.storypins.utils import unicode_csv_dict_reader
from mapstory.storypins.utils import make_point
from mapstory.mapstories.models import Map


@override_settings(DEBUG=True)
class StoryPinsTest(TransactionTestCase):
    fixtures = ['initial_data.json', 'map_data.json', 'sample_admin.json']
    c = Client()

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = get_user_model().objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password

    def get_x(self, storypin):
        x_coord = int(json.loads(storypin.the_geom)['coordinates'][0])
        return x_coord

    def setUp(self):
        user_model = get_user_model()

        test_admin_user, test_admin_password = self.create_user(username='test_admin', password='test_admin', is_superuser=True)

        self.admin = user_model.objects.get(username='test_admin')

        admin_map = Map.objects.create(owner=self.admin, zoom=1, center_x=0, center_y=0, title='map1')

        # have to use a 'dummy' map to create the appropriate JSON
        dummy = Map.objects.get(id=admin_map.id)
        dummy.id = None  # let Django auto-gen a good PK
        dummy.save()
        self.dummy = dummy
        self.admin_map = admin_map

    def make_storypins(self, mapobj, cnt=100):
        point = make_point(5, 23)
        end_time = 9999999999
        for a in range(cnt):
            # make our fake start time sort in order of creation
            start_time = "0000000%03d" % a
            # make sure some geometries are missing
            geom = point if cnt % 2 == 0 else None
            # make the names sort nicely by title/number
            StoryPin.objects.create(title='ann%2d' % a, map=mapobj,
                                      start_time=start_time,
                                      end_time=end_time, the_geom=geom).save()

    def test_copy_storypins(self):
        self.make_storypins(self.dummy)

        admin_map = Map.objects.create(owner=self.admin, zoom=1, center_x=0, center_y=0, title='map2')
        # have to use a 'dummy' map to create the appropriate JSON
        target = Map.objects.get(id=admin_map.id)
        target.id = None  # let Django auto-gen a good PK
        target.save()

        StoryPin.objects.copy_map_storypins(self.dummy.id, target)
        # make sure we have 100 and we can resolve the corresponding copies
        self.assertEqual(100, target.storypin_set.count())
        for a in self.dummy.storypin_set.all():
            self.assertTrue(target.storypin_set.get(title=a.title))

    def test_get(self):
        '''make 100 storypins and get them all as well as paging through'''
        self.make_storypins(self.dummy)

        response = self.c.get(reverse('storypins', args=[self.dummy.id]))
        rows = json.loads(response.content)['features']
        self.assertEqual(100, len(rows))

        for p in range(4):
            response = self.c.get(reverse('storypins', args=[self.dummy.id]) + "?page=%s" % p)
            rows = json.loads(response.content)['features']
            self.assertEqual(25, len(rows))

            titles = [row['properties']['title'] for row in rows]
            # check the first title on each page
            # because make_storypins() creates a set sorted by start_time,
            # these should be: (ann 0, ann25, ann50, ann75)
            self.assertEqual('ann%2d' % (p * 25), titles[0])

    def test_post(self):
        '''test post operations'''

        # make 1 and update it
        self.make_storypins(self.dummy, 1)
        ann = StoryPin.objects.filter(map=self.dummy)[0]
        data = json.dumps({
            'features': [{
                'geometry': {'type': 'Point', 'coordinates': [5.000000, 23.000000]},
                "id": ann.id,
                'properties': {
                    "title": "new title",
                    "start_time": "2001-01-01",
                    "end_time": 1371136048
                }
            }]
        })
        # without login, expect failure
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), data, "application/json")
        self.assertEqual(403, resp.status_code)

        # login and verify change accepted
        self.c.login(username="test_admin", password="test_admin")
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), data, "application/json")
        self.assertEqual(200, resp.status_code)
        ann = StoryPin.objects.get(id=ann.id)
        self.assertEqual(ann.title, "new title")
        self.assertEqual(self.get_x(ann), 5)
        self.assertEqual(ann.end_time, 1371136048)
        self.assertEqual(ann.start_time, 978307200)

        # now make a new one with just a title and null stuff
        data = json.dumps({
            'features': [{
                'properties': {
                    "title": "new ann",
                    "geometry": None
                }
            }]
        })
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), data, "application/json")
        self.assertEqual(200, resp.status_code)
        resp = json.loads(resp.content)
        self.assertEqual(resp['success'], True)
        ann = StoryPin.objects.get(id=ann.id + 1)
        self.assertEqual(ann.title, "new ann")

    def test_delete(self):
        '''test delete operations'''

        # make 10 storypins, drop numbers 4-7
        self.make_storypins(self.dummy, 10)
        current_anns = StoryPin.objects.filter(map=self.dummy)
        titles_to_delete = [u'ann 4', u'ann 5', u'ann 6', u'ann 7']
        ids_to_delete = [ann.id for ann in current_anns if ann.title in titles_to_delete]
        data = json.dumps({'action': 'delete', 'ids': ids_to_delete})
        # verify failure before login
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), data, "application/json")
        self.assertEqual(403, resp.status_code)

        # now check success
        self.c.login(username="test_admin", password="test_admin")
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), data, "application/json")
        self.assertEqual(200, resp.status_code)

        # these are gone
        ann = StoryPin.objects.filter(id__in=ids_to_delete)
        self.assertEqual(0, ann.count())
        # six remain
        ann = StoryPin.objects.filter(map=self.dummy)
        self.assertEqual(6, ann.count())

    def test_csv_upload(self):
        '''test csv upload with update and insert'''

        # @todo cleanup and break out into simpler cases

        self.make_storypins(self.dummy, 2)

        header = u"id,title,content,lat,lon,start_time,end_time,appearance\n"

        # first row is insert, second update (as it has an id)
        fp = tempfile.NamedTemporaryFile(delete=True)
        fp.write((
            header +
            u'"",foo bar,blah,5,10,2001/01/01,2005\n'
            u"1,bar foo,halb,10,20,2010-01-01,,\n"
            u"2,bunk,\u201c,20,30,,,"
        ).encode('utf-8'))
        fp.seek(0)

        # verify failure before login
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]),{'csv':fp})
        self.assertEqual(403, resp.status_code)

        # still only 2 storypins
        self.assertEqual(2, StoryPin.objects.filter(map=self.dummy.id).count())

        # login, rewind the buffer and verify
        self.c.login(username="test_admin", password="test_admin")

        fp.seek(0)
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]),{'csv':fp})
        self.assertEqual(200, resp.status_code)
        # response type must be text/html for ext fileupload
        self.assertEqual('text/html', resp['content-type'])
        jsresp = json.loads(resp.content)
        self.assertEqual(True, jsresp['success'])
        ann = StoryPin.objects.filter(map=self.dummy.id)
        # we uploaded 3, the other 2 should be deleted (overwrite mode)
        self.assertEqual(3, ann.count())
        ann = StoryPin.objects.get(title='bar foo')
        self.assertEqual(self.get_x(ann), 20.)
        ann = StoryPin.objects.get(title='bunk')
        self.assertTrue(u'\u201c', ann.content)
        ann = StoryPin.objects.get(title='foo bar')
        self.assertEqual('foo bar', ann.title)
        self.assertEqual(self.get_x(ann), 10.)

        resp = self.c.get(reverse('storypins',args=[self.dummy.id]) + "?csv")
        # verify each row has the same number of fields, even if some fields
        # are empty
        for l in resp.content.split('\r\n'):
            if l.strip():
                self.assertEqual(10, len(l.split(',')))
        x = list(unicode_csv_dict_reader(resp.content))
        self.assertEqual(3, len(x))
        by_title = dict([(v['title'], v) for v in x])
        # verify round trip of unicode quote
        self.assertEqual(u'\u201c', by_title['bunk']['content'])
        # and times
        self.assertEqual('2010-01-01T00:00:00', by_title['bar foo']['start_time'])
        self.assertEqual('2001-01-01T00:00:00', by_title['foo bar']['start_time'])
        self.assertEqual('2005-01-01T00:00:00', by_title['foo bar']['end_time'])

        # verify windows codepage quotes
        fp = tempfile.NamedTemporaryFile(delete=True)
        fp.write((
            str(header) +
            ',\x93windows quotes\x94,yay,,,,'
        ))
        fp.seek(0)
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), {'csv': fp})
        ann = StoryPin.objects.get(map=self.dummy.id)
        # windows quotes are unicode now
        self.assertEqual(u'\u201cwindows quotes\u201d', ann.title)

        # make sure a bad upload aborts the transaction (and prevents dropping existing)
        fp = tempfile.NamedTemporaryFile(delete=True)
        fp.write((
            str(header) * 2
        ))
        fp.seek(0)
        resp = self.c.post(reverse('storypins', args=[self.dummy.id]), {'csv': fp})
        self.assertEqual(400, resp.status_code)
        # there should only be one that we uploaded before
        StoryPin.objects.get(map=self.dummy.id)
        self.assertEqual('yay', ann.content)

        # and check for the errors related to the invalid data we sent
        expected = ['[1] lat : Invalid value for lat : "lat"',
                    '[1] start_time : Unable to read as date : start_time, please format as yyyy-mm-dd',
                    '[1] lon : Invalid value for lon : "lon"',
                    '[1] end_time : Unable to read as date : end_time, please format as yyyy-mm-dd']
        self.assertEqual(expected, re.findall('<li>([^<]*)</li>', resp.content))
