from django.test import Client, TestCase
from django.core.urlresolvers import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

from geonode.layers.models import Layer


class TestLayerViews(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_layers_start_out_clean(self):
        self.assertEquals(0, len(Layer.objects.all()))

    def test_create_layer(self):
        # self.assertTrue(len(Layer.objects.all()) > 0)
        pass

    def test_layer_create_view(self):
        # Map create
        response = self.client.get('/maps/new', follow=True)
        self.assertEquals(response.status_code, 200)

        self.assertEquals(0, len(Layer.objects.all()))
        form_data = {
          "name": "a new layer",
          "store": {"name": "store"},
          "namespace": {"name": 'name'},
          "attributes": {"attribute": [
            {"name": "time",
             "binding": "org.geotools.data.postgis.PostGISDialect$XDate",
             "minOccurs": 0,
             "nillable": True},
           {"name": "geometry",
             "binding": "com.vividsolutions.jts.geom.MultiLineString",
             "minOccurs":0,
             "nillable":True}]},
          "nativeCRS": "EPSG:4326",
          "srs": "EPSG:4326"
        }

        response = self.client.post(reverse('layer_create'), data=form_data, follow=True)
        self.assertEquals(response.status_code, 200)
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