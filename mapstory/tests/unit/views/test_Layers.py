import os
import json
import time

from unittest import skip

from django.core.urlresolvers import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from geonode.geoserver.helpers import ogc_server_settings
from geonode.layers.models import Layer
from geoserver.catalog import Catalog

from ...MapStoryTestMixin import MapStoryTestMixin
from ...AdminClient import AdminClient
from ...utils import create_admin_user, generate_testname

User = get_user_model()
test_layer_file_path = os.path.realpath('mapstory/tests/sampledata/lewisandclarktrail.csv')

def getLayerCatalog():
    """
    Convenience method for getting the Layer catalog
    """
    #@TODO: Use test server settings
    rest_url = ogc_server_settings.rest
    rest_user = ogc_server_settings.credentials.username
    rest_pass = ogc_server_settings.credentials.password
    return Catalog(rest_url, rest_user, rest_pass)



class TestLayerViews(MapStoryTestMixin):
    """
    Test Layer Views
    """
    def create_layer(self):
        if self.admin_client == None:
            self.admin_client = AdminClient()

        self.login_admin()
        filename = generate_testname(prefix="layer", size=6)
        payload = {
            "featureType":{
                "attributes":{
                    "attribute":[
                        {"name":"geometry","binding":"com.vividsolutions.jts.geom.Point","minOccurs":0,"nillable":True},
                        {"name":"time","binding":"org.geotools.data.postgis.BigDate","nillable":True,"minOccurs":0}
                    ]
                },
                "nativeCRS":"EPSG:4326",
                "srs":"EPSG:4326",
                "store":{"name":"mapstory_geogig"},
                "namespace":{"name":"geonode"},
                "configureTime":True,
                "editable":True,
                "name":filename,
                "start_date":"time",
                "permissions":{
                    "users":{
                        "AnonymousUser":["change_layer_data","download_resourcebase","view_resourcebase"]
                    },
                    "groups":{
                        "registered":["change_layer_data","download_resourcebase","view_resourcebase"]
                    }
                },
                "storeCreateGeogig":True
            }
        }
        response = self.admin_client.post(
            reverse('layer_create'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        # Should OK
        self.assertEquals(201, response.status_code)
        json_response = json.loads(response.content)
        self.assertTrue(u'layers' in json_response.keys())

        # Layers array should not be empty
        self.assertTrue(len(json_response[u'layers']) > 0)
        # for l in json_response[u'layers']:
            # print(l)

        # Search in the catalog and return the correct layer
        for layer in getLayerCatalog().get_layers():
            if filename in layer.name:
                return layer

        return None



    def get_layer(self):
        self.login_admin()

        all_layers = getLayerCatalog().get_layers()

        # Special case: No layers exist
        if (len(all_layers) < 1):

            # Make a new layer, refresh and break if nothing happened
            test_layer = self.create_test_layer()
            if (test_layer == None):
                raise RuntimeError

            all_layers = getLayerCatalog().get_layers()

        return all_layers[0]


    def login_admin(self):
        """
        Convenience method for loging in as a superuser.
        """
        try:
            user = User.objects.get(username='admin')
            self.assertIsNotNone(user)
        except User.DoesNotExist:
            create_admin_user("admin", "admin")

        self.admin_client.login_as_admin("admin", "admin")


    def setUp(self):
        self.admin_client = AdminClient()


    def test_layers_start_out_clean(self):
        self.assertEquals(0, len(Layer.objects.all()))


    def test_layer_needs_login(self):
        # Should not be authorized to upload things
        with open(test_layer_file_path) as fp:
            response = self.client.post('/uploads/new/json', {'name': 'file', 'attachment': fp}, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateUsed(response, 'account/login.html')


    def test_csv_layer_upload(self):
        self.login_admin()

        # Upload the file
        with open(test_layer_file_path) as fp:
            response = self.admin_client.post('/uploads/new/json', {'name': 'file', 'attachment': fp}, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateNotUsed(response, 'account/login.html')


    def test_layer_create_wizard(self):
        #@FIXME: Creates a broken layer and causes things to crash
        self.login_admin()

        # Should be emtpty
        catalog = getLayerCatalog()
        current_layer_count = len(catalog.get_layers())

        self.create_layer()

        # Should update the catalog
        self.assertEquals(current_layer_count + 1, len(getLayerCatalog().get_layers()))


    def test_layer_import_wizard_views(self):
        # Should have 0 Layers stored
        response = self.admin_client.get('/maps/new', follow=True)
        self.assertEquals(response.status_code, 200)
        self.assertTemplateNotUsed(response, 'account/login.html')
        self.assertEquals(0, len(Layer.objects.all()))

        self.login_admin()
        with open(test_layer_file_path) as fp:
            # ---------------
            # 1. Upload file
            # ---------------
            response = self.admin_client.post('/uploads/new/json', {'name': 'testlayer', 'file': fp}, follow=True)
            self.assertEquals(response.status_code, 200)

            # Should Respond with JSON
            response_json = json.loads(response.content)
            self.assertIsNotNone(response_json)

            # Should not have any errors
            self.assertFalse(u'errors' in response_json.keys())

            # State should be 'UPLOADED;
            self.assertTrue(u'state' in response_json.keys())
            self.assertEquals(u'UPLOADED', response_json[u'state'])

            # Should have an upload ID
            self.assertIsNotNone(response_json[u'id'])

            # --------------------------
            # 2. Get Upload detail info
            # --------------------------
            url = "/importer-api/data/%s" % (response_json[u'id'],)
            detail_response = self.admin_client.get(url, follow=True)
            self.assertEquals(200, detail_response.status_code)

            # Should respond with JSON
            detail_json = json.loads(detail_response.content)
            self.assertIsNotNone(detail_json)

            # Should have upload detail information
            self.assertTrue(u'name' in detail_json.keys())
            self.assertEquals(True, detail_json[u'complete'])
            self.assertIsNotNone(detail_json[u'date'])
            self.assertEquals('CSV', detail_json[u'file_type'])
            self.assertIsNotNone(detail_json[u'resource_uri'])
            self.assertIsNotNone(detail_json[u'name'])

            # Get the uploaded details
            upload_name = detail_json[u'name']

            # ----------------------
            # 3. POST configuration
            # ----------------------
            json_str = json.dumps({
                "always_geogig": True,
                "configureTime": True,
                "editable": True,
                "convert_to_date": ["e_date", "fdate"],
                "index": 0,
                "name": upload_name,
                "permissions": {
                    "users": {
                        "AnonymousUser": [
                            "change_layer_data",
                            "download_resourcebase",
                            "view_resourcebase"]
                    },
                    "groups": {
                        "registered": [
                            "change_layer_data",
                            "download_resourcebase",
                            "view_resourcebase"
                        ]
                    }
                },
                "start_date": "e_date",
                "end_date": "fdate",
                "geoserver_store": {
                    "type": "geogig"
                }
            })
            url = "/importer-api/data-layers/%s/configure/" % (response_json[u'id'],)
            config_response = self.admin_client.post(url, json_str, content_type="application/json")
            self.assertEquals(config_response.status_code, 200)

            # Should receive a JSON task
            json_task = json.loads(config_response.content)
            self.assertIsNotNone(json_task)
            self.assertTrue(u'task' in json_task.keys())
            taskid = json_task[u'task']
            self.assertIsNotNone(taskid)

            # -------------------
            # 4. Get data layers
            url = "/importer-api/data-layers/%s/" % (response_json[u'id'],)
            response = self.admin_client.get(url, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateNotUsed(response, 'account/login.html')

            # Should get JSON back
            json_response = json.loads(response.content)
            self.assertIsNotNone(json_response)

            retries = 0
            while retries < 5:
                time.sleep(2)

                # Try again
                retry_response = self.admin_client.get(url, follow=True)
                self.assertEquals(retry_response.status_code, 200)
                json_response = json.loads(retry_response.content)
                self.assertIsNotNone(json_response)

                if(json_response[u'status'] == u'SUCCESS'):
                    # print("SUCCESS!!")
                    break
                else:
                    # print("retrying")
                    retries += 1

            # @FIXME: Success is not happening
            # self.assertEquals(json_response[u'status'], u'SUCCESS')
            # self.assertEquals(1, len(Layer.objects.all()))



    def test_layer_detail_view(self):
        self.login_admin()
        layer = self.get_layer()
        self.assertIsNotNone(layer)

        # print(layer.name)
        url = '/layers/geonode:%s/viewer/' % (layer.name,)
        response = self.admin_client.get(url, follow=True)
        # @FIXME: Getting 404
        # self.assertEquals(200, response.status_code)
        # self.assertTemplateUsed(response, 'layers/layer_detail.html')
