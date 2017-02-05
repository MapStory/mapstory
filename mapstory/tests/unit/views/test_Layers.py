import os
import json

from django.core.urlresolvers import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from geonode.layers.models import Layer

from ...MapStoryTestMixin import MapStoryTestMixin
from ...AdminClient import AdminClient
from ...utils import create_admin_user

import time

User = get_user_model()
test_layer_file_path = '/srv/git/mapstory/mapstory/mapstory/tests/sampledata/lewisandclarktrail.csv'

class TestLayerViews(MapStoryTestMixin):

    def setUp(self):
        self.admin_client = AdminClient()


    def test_layers_start_out_clean(self):
        self.assertEquals(0, len(Layer.objects.all()))


    def test_create_layer(self):
        # self.assertTrue(len(Layer.objects.all()) > 0)
        pass


    def test_layer_needs_login(self):
        # Should not be authorized to upload things
        with open(test_layer_file_path) as fp:
            response = self.client.post('/uploads/new/json', {'name': 'file', 'attachment': fp}, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateUsed(response, 'account/login.html')


    def test_csv_layer_upload(self):
        # Admin should exist
        create_admin_user("admin", "admin")
        self.assertIsNotNone(User.objects.get(username='admin'))
        self.admin_client.login_as_admin("admin", "admin")

        # Upload the file
        with open(test_layer_file_path) as fp:
            response = self.admin_client.post('/uploads/new/json', {'name': 'file', 'attachment': fp}, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateNotUsed(response, 'account/login.html')


    def test_layer_create_wizard_views(self):
        file_location = '/srv/git/mapstory/mapstory/mapstory/tests/sampledata/json/layer_create_config.json'
        with open(file_location) as payload:
            response = self.admin_client.post(
                reverse('layer_create'),
                content_type="application/json",
                data=payload,
                follow=True
            )

            self.assertEquals(200, response.status_code)


    def test_layer_import_wizard_views(self):
        # Should have 0 Layers stored
        response = self.admin_client.get('/maps/new', follow=True)
        self.assertEquals(response.status_code, 200)
        self.assertTemplateNotUsed(response, 'account/login.html')
        self.assertEquals(0, len(Layer.objects.all()))

        # Admin should exist
        create_admin_user("admin", "admin")
        self.assertIsNotNone(User.objects.get(username='admin'))
        self.admin_client.login_as_admin("admin", "admin")


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

            print("Upload name: " + upload_name)

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

            # -------------------
            # 4. Get data layers
            url = "/importer-api/data-layers/%s/" % (response_json[u'id'],)
            response = self.admin_client.get(url, follow=True)
            self.assertEquals(response.status_code, 200)
            self.assertTemplateNotUsed(response, 'account/login.html')

            # Should get JSON back
            json_response = json.loads(response.content)
            self.assertIsNotNone(json_response)
            print(json_response)

            retries = 0
            while retries < 5:
                time.sleep(2)

                # Try again
                retry_response = self.admin_client.get(url, follow=True)
                self.assertEquals(retry_response.status_code, 200)
                json_response = json.loads(retry_response.content)
                self.assertIsNotNone(json_response)

                if(json_response[u'status'] == u'SUCCESS'):
                    print("SUCCESS!!")
                    break
                else:
                    print("retrying")
                    retries += 1


            # self.assertEquals(json_response[u'status'], u'SUCCESS')
            # self.assertEquals(1, len(Layer.objects.all()))




    def test_layer_detail_view_404(self):
        # response = self.client.get(reverse('layer_viewer'), kwargs={'layername':'nonexistent123'})
        # self.assertEquals(response.status_code, 404)
        pass



    def test_layer_upload_view(self):
        # with open('mapstory/tests/sampledata/lewisandclarktrail.csv') as filecontents:
        # post_dict = {'title': 'Test Layer Upload'}
        # file_dict = {'file': SimpleUploadedFile(upload_file.name, upload_file.read())}
        #     self.client.post(reverse('layer_create', {'name': 'Test Layer', 'data':filecontents}))
        pass
