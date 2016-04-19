from django.test import TestCase
from django.core.urlresolvers import reverse
import datetime
import json
from mapstory.tests import MapStoryTestMixin, AdminClient
from .models import Location,LocationType,LocationName


class GazTest(TestCase):

    def setUp(self):
        LocationType.objects.create(code="PPL", label="Populated Place", definition = "def", citation = "http://www.geonames.org/export/codes.html")
        Location.objects.create(defaultName="Wollongong", locationType=LocationType.objects.first(), latitude=-34.433056 , longitude=150.883057 )
        LocationName.objects.create(name="Wollongong", language='en', location=Location.objects.first() )
        LocationName.objects.create(name="http://dbpedia.org/resource/Wollongong", namespace="http://dbpedia.org/resource/", location=Location.objects.first() )
    
    def test_location_match(self):
        """
        Tests finding a gazetteer entry.
        """

        data = json.loads ( '''{
            "locationType": "PPL",
            "names": [
                {
                "name": "Wollongong",
                "language": "en"
                }
            ]
            }''' )
        
        
        c = AdminClient()
        response = c.post(reverse('matchloc'),  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200, 'Not found: body ' + response.content )
        locr = json.loads(response.content)
        
#        import ipdb; ipdb.set_trace()
        self.assertIsInstance(locr,dict,'Response type not formatted as valid dictionary' )
        self.assertTrue(locr.has_key('name_lang'),'Response does not include name+language match list' )
        self.assertEqual(len(locr['name_lang']), 1, 'Response should contain exactly one match : ' + response.content) 
        self.assertEqual(locr['name_lang'][0]['defaultName'], "Wollongong")       
      
        data = json.loads ( '''{
            "locationType": "PPL",
            "names": [
                {
                "name": "http://dbpedia.org/resource/Wollongong",
                "namespace": "http://dbpedia.org/resource/"
                }
            ]
            }''' )
        
        
        c = AdminClient()
        response = c.post(reverse('matchloc'),  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200, 'Error matching: body ' + response.content)
        locr = json.loads(response.content)
        self.assertEqual(len(locr['name_lang']), 0, 'Response should not contain name match: ' + response.content)
        self.assertEqual(len(locr['code']), 1, 'Response should not contain name match: ' + response.content)        
        self.assertEqual(locr['code'][0]['defaultName'], "Wollongong")
        # self.assertEqual(locr['defaultName'], "Wollongong")
        # self.assertEqual(locr['defaultName'], "Wollongong") 
        
        data = json.loads ( '''{
            "locationType": "XXX",
            "names": [
                {
                "name": "Wollongong",
                "language": "en"
                }
            ]
            }''' )

        c = AdminClient()
        response = c.post(reverse('matchloc'),  data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200, 'Response should be 200, with empty list')
        locr = json.loads(response.content)
        self.assertEqual(len(locr['code'])+len(locr['name_lang'])+len(locr['name']), 0, 'Response should not contain any matches: ' + response.content)
 
    def test_locationname_insert(self):
        """
        Tests insertion of a name to a specific location .
        """

        loc= Location.objects.first()
        
        c = AdminClient()
        c.login_as_admin()
        import pdb; pdb.set_trace()
        response = c.get(reverse('getloc', args=[loc.id]))
        self.assertEqual(response.status_code, 200)

        # test various equivalent null forms are handled
        for data in [  {"name":"The Gong","language":None},  {"name":"The Gong","language":''} ,  {"name":"The Gong"} ] :
        
            response = c.post(reverse('recordname', args=[loc.id]), data=json.dumps(data), content_type='application/json')
            self.assertEqual(response.status_code, 200,'Insert name failed')
            response = c.get(reverse('getloc', args=[loc.id]))
            self.assertEqual(response.status_code, 200,'Location not retrieved after insert of name')
            locr = json.loads(response.content)
            # check only one exists, and it has no language set
            count = 0
            for n in locr['names'] :
                if n['name'] == data['name'] :
                    self.assertIsNone(n.get('language'),'language value should be missing')
                    count +=1
            self.assertEqual( count, 1, 'Insert of name with no language failed: incorrect count {0!s}'.format( count)) 

        # test overiding null language, and inserting new name 
        for data in [  {"name":"The Gong","language":'en'},  {"name":"Wollongong City","language":'fr'} , {"name":"Wollongong City","language":'en'} ] :
        
            response = c.post(reverse('recordname', args=[loc.id]), data=json.dumps(data), content_type='application/json')
            self.assertEqual(response.status_code, 200,'Insert name failed')
            response = c.get(reverse('getloc', args=[loc.id]))
            self.assertEqual(response.status_code, 200,'Location not retrieved after insert of name')
            locr = json.loads(response.content)
            # check only one exists, and it has no language set
            count = 0
            for n in locr['names'] :
                if n['name'] == data['name'] :
                    if n['language'] == data['language'] :
                        count +=1
                    else :
                        self.assertIsNotNone(n.get('language'),'Name with language not set should not occur after language specified for name')
            
            self.assertEqual( count, 1, 'Insert of name with no language failed: incorrect count {0!s}'.format( count)) 
            
        data = {"name":"732","namespace":'http://abs.gov.au/admincodes/',"language":''}
        response = c.post(reverse('recordname', args=[loc.id]), data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)    

        response = c.get(reverse('getloc', args=[loc.id]))
        
        self.assertEqual(response.status_code, 200)
        locr = json.loads(response.content)
        
        # now we can test it - it shows up OK in the debugger here..
        
#        self.assertEqual(locr.names, m)
 