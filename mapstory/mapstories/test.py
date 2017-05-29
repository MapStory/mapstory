import json
import os
import time

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from geonode.geoserver.helpers import ogc_server_settings
from geoserver.catalog import Catalog
from unittest import skip

from mapstory.tests.AdminClient import AdminClient
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin
from mapstory.tests.utils import create_admin_user, generate_testname
from geonode.maps.models import Layer

User = get_user_model()
test_layer_file_path = os.path.realpath('mapstory/tests/sampledata/lewisandclarktrail.csv')


class LayerTests(MapStoryTestMixin):

    def setUp(self):
        self.admin_client = AdminClient()

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

    @skip("Fix this")
    def test_create_layer(self):

        filename = generate_testname(prefix='layer_', size=5)
        payload = {
            "featureType": {
                "attributes": {
                    "attribute": [
                        {"name": "geometry", "binding": "com.vividsolutions.jts.geom.Point", "minOccurs": 0,
                         "nillable": True},
                        {"name": "time", "binding": "org.geotools.data.postgis.BigDate", "nillable": True,
                         "minOccurs": 0}
                    ]
                },
                "nativeCRS": "EPSG:4326",
                "srs": "EPSG:4326",
                "store": {"name": "mapstory_geogig"},
                "namespace": {"name": "geonode"},
                "configureTime": True,
                "editable": True,
                "name": filename,
                "start_date": "time",
                "permissions": {
                    "users": {
                        "AnonymousUser": ["change_layer_data", "download_resourcebase", "view_resourcebase"]
                    },
                    "groups": {
                        "registered": ["change_layer_data", "download_resourcebase", "view_resourcebase"]
                    }
                },
                "storeCreateGeogig": True
            }
        }

        self.login_admin()
        response = self.admin_client.post(
            reverse('layer_create'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
        )

        self.assertEqual(201, response.status_code)
        json_response = json.loads(response.content)
        self.assertTrue(u'layers' in json_response.keys())

        self.assertTrue(len(json_response[u'layers']) > 0)

    def test_layer_upload_needs_login(self):
        # Should not be authorized to upload things
        with open(test_layer_file_path) as fp:
            response = self.client.post('/uploads/new/json', {'name': 'file', 'attachment': fp}, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateUsed(response, 'account/login.html')

    def test_csv_layer_upload(self):
        self.login_admin()

        with open(test_layer_file_path) as fp:
            response = self.admin_client.post(
                '/uploads/new/json',
                {'name': 'file', 'attachment': fp},
                follow=True
            )
            self.assertEqual(response.status_code, 200)
            self.assertTemplateNotUsed(response, 'account/login.html')

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

                if json_response[u'status'] == u'SUCCESS':
                    break
                else:
                    retries += 1
                    # @FIXME: Success is not happening
