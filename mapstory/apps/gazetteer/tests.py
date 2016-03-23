from django.test import TestCase
from django.core.urlresolvers import reverse
import datetime
import json
from mapstory.tests import MapStoryTestMixin, AdminClient
from .models import Location,LocationType,LocationName
import pdb

class GazTest(TestCase):

    def setUp(self):
        LocationType.objects.create(code="PPL", label="Populated Place", definition = "def", citation = "http://www.geonames.org/export/codes.html")
        Location.objects.create(defaultName="Wollongong", locationType=LocationType.objects.first(), latitude=-35, longitude=151 )
        
    def test_locationname_insert(self):
        """
        Tests various methods of the gazetteer.
        """

        loc= Location.objects.first()
        
        c = AdminClient()
        response = c.get(reverse('getloc', args=[loc.id]))
        self.assertEqual(response.status_code, 200)

        c.login_as_admin()

        data = {"name":"The Gong","language":'en'}

        response = c.post(reverse('recordname', args=[loc.id]), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        pdb.set_trace()
        locx = Location.objects.get(id=loc.id)

        response = c.get(reverse('getloc', args=[loc.id]))
        
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        
        # now we can test it - it shows up OK in the debugger here..
        
#        self.assertEqual(locr.names, m)
 