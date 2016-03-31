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
        Location.objects.create(defaultName="Wollongong", locationType=LocationType.objects.first(), latitude=-34.433056 , longitude=150.883057 )
        LocationName.objects.create(name="Wollongong", language='en', location=Location.objects.first() )
        LocationName.objects.create(name="http://dbpedia.org/resource/Wollongong", language='', namespace="http://dbpedia.org/resource/", location=Location.objects.first() )
    
    def test_location_match(self):
        """
        Tests finding a gazetteer entry.
        """
        
        data = json.loads ( '''{
            type: "PPL",
            names: [
                {
                name: "Wollongong",
                language: "en"
                }
            ]
            }''' )
        
        
        c = AdminClient()
        response = c.post(reverse('matchloc',  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        self.assertEqual(locr['defaultName'], "Wollongong")       

       data = json.loads ( '''{
            type: "PPL",
            names: [
                {
                name: "http://dbpedia.org/resource/Wollongong",
                namespace: "http://dbpedia.org/resource/"
                }
            ]
            }''' )
        
        
        c = AdminClient()
        response = c.post(reverse('matchloc',  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        self.assertEqual(locr['defaultName'], "Wollongong") 
        
        data = json.loads ( '''{
            type: "XXX",
            names: [
                {
                name: "Wollongong",
                language: "en"
                }
            ]
            }''' )

        c = AdminClient()
        response = c.post(reverse('matchloc',  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        self.assertEqual(bool(locr), False) 
        
    def test_locationname_insert(self):
        """
        Tests insertion of a name to a specific location .
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
    
        data = {"name":"732","namespace":'http://abs.gov.au/admincodes/',"language":''}
        response = c.post(reverse('recordname', args=[loc.id]), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)    

        response = c.get(reverse('getloc', args=[loc.id]))
        
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        
        # now we can test it - it shows up OK in the debugger here..
        
#        self.assertEqual(locr.names, m)
 