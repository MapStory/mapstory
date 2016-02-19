import os
import json
from django import db
from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib.gis.gdal import DataSource
from .importers import GDALImport
from .utils import create_vrt, configure_time, ensure_defaults
from .inspectors import GDALInspector, OGRFieldConverter
from geoserver.catalog import Catalog, FailedRequestError
from geonode.layers.models import Layer
from geonode.geoserver.helpers import ogc_server_settings
from geonode.geoserver.helpers import gs_slurp
from mapstory.importer.models import UploadLayer
from .models import validate_file_extension, IMPORTER_VALID_EXTENSIONS, ValidationError, validate_inspector_can_read
from .models import UploadedData
from .handlers import GeoWebCacheHandler

User = get_user_model()


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


class MapStoryTestMixin(TestCase):

    def assertLoginRequired(self, response):
        self.assertEqual(response.status_code, 302)
        self.assertTrue('login' in response.url)

    def assertHasGoogleAnalytics(self, response):
        self.assertTrue('mapstory/google_analytics.html' in [t.name for t in response.templates])

    def create_user(self, username, password, **kwargs):
        """
        Convenience method for creating users.
        """
        user, created = User.objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return username, password


class UploaderTests(MapStoryTestMixin):
    """
    Basic checks to make sure pages load, etc.
    """

    def create_datastore(self, connection, catalog):
        settings = connection.settings_dict
        params = {'database': settings['NAME'],
                  'passwd': settings['PASSWORD'],
                  'namespace': 'http://www.geonode.org/',
                  'type': 'PostGIS',
                  'dbtype': 'postgis',
                  'host': settings['HOST'],
                  'user': settings['USER'],
                  'port': settings['PORT'],
                  'enabled': "True"}

        store = catalog.create_datastore(settings['NAME'], workspace=self.workspace)
        store.connection_parameters.update(params)

        try:
            catalog.save(store)
        except FailedRequestError:
            # assuming this is because it already exists
            pass

        return catalog.get_store(settings['NAME'])

    def setUp(self):

        if not os.path.exists(os.path.join(os.path.split(__file__)[0], 'test_ogr')):
            self.skipTest('Skipping test due to missing test data.')

        # These tests require geonode to be running on :80!
        self.postgis = db.connections['datastore']
        self.postgis_settings = self.postgis.settings_dict

        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_username, self.non_admin_password = self.create_user('non_admin', 'non_admin')
        self.cat = Catalog(ogc_server_settings.internal_rest, *ogc_server_settings.credentials)
        self.workspace = 'geonode'
        self.datastore = self.create_datastore(self.postgis, self.cat)

    def tearDown(self):
        """
        Clean up geoserver.
        """
        self.cat.delete(self.datastore, recurse=True)

    def generic_import(self, file, configuration_options=[{'index': 0}]):

        f = file
        filename = os.path.join(os.path.dirname(__file__), 'test_ogr', f)

        res = self.import_file(filename, configuration_options=configuration_options)
        layer = Layer.objects.get(name=res[0][0])
        self.assertEqual(layer.srid, 'EPSG:4326')
        self.assertEqual(layer.store, self.datastore.name)
        self.assertEqual(layer.storeType, 'dataStore')

        if not filename.endswith('zip'):
            self.assertTrue(layer.attributes.count() >= DataSource(filename)[0].num_fields)

        # make sure we have at least one dateTime attribute
        self.assertTrue('xsd:dateTime' or 'xsd:date' in [n.attribute_type for n in layer.attributes.all()])

        return layer

    def test_box_with_year_field(self):
        """
        Tests the import of test_box_with_year_field.
        """

        layer = self.generic_import('boxes_with_year_field.shp', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)

        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_box_with_year_field2(self):
        """
        Tests the import of test_box_with_year_field_2.
        """

        layer = self.generic_import('boxes_with_year_field2.shp', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)

        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_boxes_with_date(self):
        """
        Tests the import of test_boxes_with_date.
        """

        layer = self.generic_import('boxes_with_date.shp', configuration_options=[{'index': 0,
                                                                                   'convert_to_date': ['date'],
                                                                                   'start_date': 'date',
                                                                                   'configureTime': True
                                                                                   }])

        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')
        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_boxes_with_date_csv(self):
        """
        Tests a CSV with WKT polygon.
        """

        layer = self.generic_import('boxes_with_date.csv', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)
        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_schema_csv(self):
        """
        Tests a CSV from schema download.
        """
        layer = self.generic_import('schema_download.csv', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)
        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_boxes_with_iso_date(self):
        """
        Tests the import of test_boxes_with_iso_date.
        """

        layer = self.generic_import('boxes_with_date_iso_date.shp', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)

        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_duplicate_imports(self):
        """
        Tests importing the same layer twice to ensure incrementing file names is properly handled.
        """
        filename = os.path.join(os.path.dirname(__file__), 'test_ogr', 'boxes_with_date_iso_date.zip')

        gi = GDALImport(filename)
        layers1 = gi.handle({'index': 0, 'name': 'test'})
        layers2 = gi.handle({'index': 0,  'name': 'test'})

        self.assertEqual(layers1[0][0], 'test')
        self.assertEqual(layers2[0][0], 'test0')

    def test_boxes_with_date_iso_date_zip(self):
        """
        Tests the import of test_boxes_with_iso_date.
        """

        layer = self.generic_import('boxes_with_date_iso_date.zip', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)

        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_boxes_with_dates_bc(self):
        """
        Tests the import of test_boxes_with_dates_bc.
        """

        layer = self.generic_import('boxes_with_dates_bc.shp', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])

        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)

        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_point_with_date(self):
        """
        Tests the import of test_boxes_with_dates_bc.
        """

        layer = self.generic_import('point_with_date.geojson', configuration_options=[{'index': 0,
                                                                                         'convert_to_date': ['date']}])

        # OGR will name geojson layers 'ogrgeojson' we rename to the path basename
        self.assertTrue(layer.name.startswith('point_with_date'))
        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, 'xsd:dateTime')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,)
        self.generic_time_check(layer, attribute=date_attr.attribute)

    def test_boxes_with_end_date(self):
        """
        Tests the import of test_boxes_with_end_date.
        This layer has a date and an end date field that are typed correctly.
        """

        layer = self.generic_import('boxes_with_end_date.shp')

        date_attr = filter(lambda attr: attr.attribute == 'date', layer.attributes)[0]
        end_date_attr = filter(lambda attr: attr.attribute == 'enddate', layer.attributes)[0]

        self.assertEqual(date_attr.attribute_type, 'xsd:date')
        self.assertEqual(end_date_attr.attribute_type, 'xsd:date')

        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute,
                       end_attribute=end_date_attr.attribute)

        self.generic_time_check(layer, attribute=date_attr.attribute, end_attribute=end_date_attr.attribute)

    def test_us_states_kml(self):
        """
        Tests the import of us_states_kml.
        This layer has a date and an end date field that are typed correctly.
        """
        # TODO: Support time in kmls.

        layer = self.generic_import('us_states.kml')

    def test_mojstrovka_gpx(self):
        """
        Tests the import of mojstrovka.gpx.
        This layer has a date and an end date field that are typed correctly.
        """
        layer = self.generic_import('mojstrovka.gpx')
        date_attr = filter(lambda attr: attr.attribute == 'time', layer.attributes)[0]
        self.assertEqual(date_attr.attribute_type, u'xsd:dateTime')
        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_attr.attribute)
        self.generic_time_check(layer, attribute=date_attr.attribute)

    def generic_time_check(self, layer, attribute=None, end_attribute=None):
        """
        Convenience method to run generic tests on time layers.
        """
        self.cat._cache.clear()
        resource = self.cat.get_resource(layer.name, store=layer.store, workspace=self.workspace)

        timeInfo = resource.metadata['time']
        self.assertEqual("LIST", timeInfo.presentation)
        self.assertEqual(True, timeInfo.enabled)
        self.assertEqual(attribute, timeInfo.attribute)
        self.assertEqual(end_attribute, timeInfo.end_attribute)

    def test_us_shootings_csv(self):
        """
        Tests the import of US_shootings.csv.
        """

        filename = 'US_shootings.csv'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', filename)
        layer = self.generic_import(filename, configuration_options=[{'index': 0, 'convert_to_date': ['Date']}])
        self.assertEqual(layer.name, 'us_shootings')

        date_field = 'date'
        configure_time(self.cat.get_layer(layer.name).resource, attribute=date_field)
        self.generic_time_check(layer, attribute=date_field)

    def test_sitins(self):
        """
        Tests the import of US_shootings.csv.
        """

        filename = 'US_Civil_Rights_Sitins0.csv'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', filename)
        layer = self.generic_import(f, configuration_options=[{'index': 0, 'convert_to_date': ['Date']}])

    def get_layer_names(self, in_file):
        """
        Gets layer names from a data source.
        """
        ds = DataSource(in_file)
        return map(lambda layer: layer.name, ds)

    def test_gdal_import(self):
        filename = 'point_with_date.geojson'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', filename)
        self.generic_import(filename, configuration_options=[{'index': 0,  'convert_to_date': ['date']}])

    def import_file(self, in_file, configuration_options=[]):
        """
        Imports the file.
        """
        self.assertTrue(os.path.exists(in_file))

        # run ogr2ogr
        gi = GDALImport(in_file)
        layers = gi.handle(configuration_options=configuration_options)

        return layers

    @staticmethod
    def createFeatureType(catalog, datastore, name):
        """
        Exposes a PostGIS feature type in geoserver.
        """
        headers = {"Content-type": "application/xml"}
        data = "<featureType><name>{name}</name></featureType>".format(name=name)
        url = datastore.href.replace(".xml", '/featuretypes.xml'.format(name=name))
        headers, response = catalog.http.request(url, "POST ", data, headers)
        return response

    def test_create_vrt(self):
        """
        Tests the create_vrt function.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'US_shootings.csv')

        vrt = create_vrt(f)
        vrt.seek(0)
        output = vrt.read()

        self.assertTrue('name="US_shootings"' in output)
        self.assertTrue('<SrcDataSource>{0}</SrcDataSource>'.format(f) in output)
        self.assertTrue('<GeometryField encoding="PointFromColumns" x="Longitude" y="Latitude" />'.format(f) in output)
        self.assertEqual(os.path.splitext(vrt.name)[1], '.vrt')

    def test_file_add_view(self):
        """
        Tests the file_add_view.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()

        # test login required for this view
        request = c.get(reverse('uploads-new'))
        self.assertEqual(request.status_code, 302)

        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['request'].path, reverse('uploads-list'))
        self.assertTrue(len(response.context['object_list']) == 1)

        upload = response.context['object_list'][0]
        self.assertEqual(upload.user.username, 'non_admin')
        self.assertEqual(upload.file_type, 'GeoJSON')
        self.assertTrue(upload.uploadlayer_set.all())
        self.assertEqual(upload.state, 'UPLOADED')
        self.assertIsNotNone(upload.name)

        uploaded_file = upload.uploadfile_set.first()
        self.assertTrue(os.path.exists(uploaded_file.file.path))


        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'empty_file.geojson')

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn('file', response.context_data['form'].errors)

    def test_file_add_view_as_json(self):
        """
        Tests the file_add_view.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new-json'), {'file': fp}, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn('application/json', response.get('Content-Type', ''))
        content = json.loads(response.content)
        self.assertIn('state', content)
        self.assertIn('id', content)

    def test_describe_fields(self):
        """
        Tests the describe fields functionality.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'us_shootings.csv')
        fields = None

        with GDALInspector(f) as f:
            layers = f.describe_fields()

        self.assertTrue(layers[0]['name'], 'us_shootings')
        self.assertEqual([n['name'] for n in layers[0]['fields']], ['Date', 'Shooter', 'Killed',
                                                                    'Wounded', 'Location', 'City',
                                                                    'Longitude', 'Latitude'])
        self.assertEqual(layers[0]['feature_count'], 203)

    def test_gdal_file_type(self):
        """
        Tests the describe fields functionality.
        """
        files = ((os.path.join(os.path.dirname(__file__), 'test_ogr', 'us_shootings.csv'), 'CSV'),
                 (os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson'), 'GeoJSON'),
                 (os.path.join(os.path.dirname(__file__), 'test_ogr', 'mojstrovka.gpx'), 'GPX'),
                 (os.path.join(os.path.dirname(__file__), 'test_ogr', 'us_states.kml'), 'KML'),
                 (os.path.join(os.path.dirname(__file__), 'test_ogr', 'boxes_with_year_field.shp'), 'ESRI Shapefile'),
                 (os.path.join(os.path.dirname(__file__), 'test_ogr', 'boxes_with_date_iso_date.zip'), 'ESRI Shapefile'),
        )

        for path, file_type in files:
            with GDALInspector(path) as f:
                self.assertEqual(f.file_type(), file_type)

    def test_append(self):
        """
        Tests the configuration view.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        new_user = User.objects.create(username='test')
        new_user_perms = ['change_resourcebase_permissions']
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        payload = [{'index': 0,
                    'name': 'append',
                    'convert_to_date': ['date'],
                    'start_date': 'date',
                    'configureTime': True,
                    'editable': True,
                    'permissions': {'users': {'test': new_user_perms,
                                              'AnonymousUser': ["change_layer_data", "download_resourcebase",
                                                                "view_resourcebase"]}}}]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*) from append')
        self.assertEqual(1,cursor.fetchone()[0])

        payload[0]['appendTo'] = 'geonode:append'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date_2.geojson')


        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*) from append')
        self.assertEqual(2,cursor.fetchone()[0])

    def test_trunc_append(self):
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'long_attr_name.geojson')
        new_user = User.objects.create(username='test')
        new_user_perms = ['change_resourcebase_permissions']
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        payload = [{'index': 0,
                    'name': 'append',
                    'convert_to_date': ['date_as_date'],
                    'start_date': 'date_as_date',
                    'configureTime': True,
                    'editable': True,
                    'permissions': {'users': {'test': new_user_perms,
                                              'AnonymousUser': ["change_layer_data", "download_resourcebase",
                                                                "view_resourcebase"]}}}]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*) from append')
        self.assertEqual(1, cursor.fetchone()[0])

        payload[0]['appendTo'] = 'geonode:append'
        payload[0]['convert_to_date'] = ['date_as_da']
        payload[0]['start_date'] = 'date_as_da'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'long_attr_trunc.geojson')


        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*), date from append group by date')
        result = cursor.fetchone()
        #ensure that the feature was added and the attribute was appended
        self.assertEqual(2,result[0])
        self.assertNotEqual(None,result[1])

    def test_schema_append(self):
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'schema_initial.zip')
        new_user = User.objects.create(username='test')
        new_user_perms = ['change_resourcebase_permissions']
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        payload = [{'index': 0,
                    'name': 'append',
                    'convert_to_date': ['date'],
                    'start_date': 'date',
                    'configureTime': True,
                    'editable': True,
                    'permissions': {'users': {'test': new_user_perms,
                                              'AnonymousUser': ["change_layer_data", "download_resourcebase",
                                                                "view_resourcebase"]}}}]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*) from append')
        self.assertEqual(1, cursor.fetchone()[0])

        payload[0]['appendTo'] = 'geonode:append'
        payload[0]['convert_to_date'] = ['date']
        payload[0]['start_date'] = 'date'
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'schema_append.zip')


        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        cursor = db.connections['datastore'].cursor()
        cursor.execute('select count(*), date from append group by date')
        result = cursor.fetchone()
        import pdb;pdb.set_trace()
        #ensure that the feature was added and the attribute was appended
        self.assertEqual(2,result[0])
        self.assertNotEqual(None,result[1])

    def test_configure_view(self):
        """
        Tests the configuration view.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        new_user = User.objects.create(username='test')
        new_user_perms = ['change_resourcebase_permissions']
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        payload = [{'index': 0,
                    'convert_to_date': ['date'],
                    'start_date': 'date',
                    'configureTime': True,
                    'editable': True,
                    'permissions': {'users': {'test': new_user_perms,
                                              'AnonymousUser': ["change_layer_data", "download_resourcebase",
                                                                "view_resourcebase"]}}}]

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')

        self.assertTrue(response.status_code, 200)

        layer = Layer.objects.all()[0]
        self.assertEqual(layer.srid, 'EPSG:4326')
        self.assertEqual(layer.store, self.datastore.name)
        self.assertEqual(layer.storeType, 'dataStore')
        self.assertTrue(layer.attributes[1].attribute_type, 'xsd:dateTime')
        self.assertEqual(Layer.objects.all()[0].owner.username, self.non_admin_username)

        perms = layer.get_all_level_info()
        user = User.objects.get(username=self.non_admin_username)

        # check user permissions
        for perm in [u'publish_resourcebase', u'change_resourcebase_permissions',
                     u'delete_resourcebase', u'change_resourcebase', u'change_resourcebase_metadata',
                     u'download_resourcebase', u'view_resourcebase', u'change_layer_style',
                     u'change_layer_data']:
            self.assertIn(perm, perms['users'][user])

        self.assertTrue(perms['users'][new_user])
        self.assertIn('change_resourcebase_permissions', perms['users'][new_user])

        self.assertIn("change_layer_data", perms['users'][User.objects.get(username='AnonymousUser')])

        lyr = self.cat.get_layer(layer.name)
        self.assertTrue('time' in lyr.resource.metadata)
        self.assertEqual(UploadLayer.objects.first().layer, layer)

    def test_configure_view_convert_date(self):
        """
        Tests the configure view with a dataset that needs to be converted to a date.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'US_shootings.csv')
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        upload = response.context['object_list'][0]

        payload = [{'index': 0,
                    'convert_to_date': ['Date'],
                    'start_date': 'Date',
                    'configureTime': True,
                    'editable': True}]


        response = c.get('/importer-api/data-layers/{0}/configure/'.format(upload.id))
        self.assertEqual(response.status_code, 405)

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id))
        self.assertEqual(response.status_code, 400)

        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
                          content_type='application/json')
        self.assertTrue(response.status_code, 200)

        layer = Layer.objects.all()[0]
        self.assertEqual(layer.srid, 'EPSG:4326')
        self.assertEqual(layer.store, self.datastore.name)
        self.assertEqual(layer.storeType, 'dataStore')
        self.assertTrue(layer.attributes[1].attribute_type, 'xsd:dateTime')
        self.assertTrue(layer.attributes.filter(attribute='date'), 'xsd:dateTime')

        lyr = self.cat.get_layer(layer.name)
        self.assertTrue('time' in lyr.resource.metadata)
        # ensure a user who does not own the upload cannot configure an import from it.
        c.logout()
        c.login_as_admin()
        response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id))
        self.assertEqual(response.status_code, 404)

    def test_list_api(self):
        c = AdminClient()

        response = c.get('/importer-api/data/')
        self.assertEqual(response.status_code, 401)

        c.login_as_non_admin()

        response = c.get('/importer-api/data/')
        self.assertEqual(response.status_code, 200)

        admin = User.objects.get(username=self.username)
        non_admin = User.objects.get(username=self.non_admin_username)
        from .models import UploadFile

        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'US_shootings.csv')

        with open(f, 'rb') as f:
            uploaded_file = SimpleUploadedFile('test_data', f.read())
            admin_upload = UploadedData.objects.create(state='Admin test', user=admin)
            admin_upload.uploadfile_set.add(UploadFile.objects.create(file=uploaded_file))

            non_admin_upload = UploadedData.objects.create(state='Non admin test', user=non_admin)
            non_admin_upload.uploadfile_set.add(UploadFile.objects.create(file=uploaded_file))

        c.login_as_admin()
        response = c.get('/importer-api/data/')
        self.assertEqual(response.status_code, 200)
        body = json.loads(response.content)
        self.assertEqual(len(body['objects']), 2)

        response = c.get('/importer-api/data/?user__username=admin')
        self.assertEqual(response.status_code, 200)
        body = json.loads(response.content)
        self.assertEqual(len(body['objects']), 1)

    def test_layer_list_api(self):
        c = AdminClient()
        response = c.get('/importer-api/data-layers/')
        self.assertEqual(response.status_code, 401)

        c.login_as_non_admin()

        response = c.get('/importer-api/data-layers/')
        self.assertEqual(response.status_code, 200)

    def test_delete_from_non_admin_api(self):
        """
        Ensure users can delete their data.
        """
        c = AdminClient()

        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        self.assertEqual(UploadedData.objects.all().count(), 1)
        id = UploadedData.objects.first().id
        response = c.delete('/importer-api/data/{0}/'.format(id))
        self.assertEqual(response.status_code, 204)

        self.assertEqual(UploadedData.objects.all().count(), 0)

    def test_delete_from_admin_api(self):
        """
        Ensure that administrators can delete data that isn't theirs.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        self.assertEqual(UploadedData.objects.all().count(), 1)

        c.logout()
        c.login_as_admin()

        id = UploadedData.objects.first().id
        response = c.delete('/importer-api/data/{0}/'.format(id))

        self.assertEqual(response.status_code, 204)

        self.assertEqual(UploadedData.objects.all().count(), 0)


    def naming_an_import(self):
        """
        Tests providing a name in the configuration options.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()
        c.login_as_non_admin()
        name = 'point-with-a-date'
        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        payload = {'index': 0,
                   'convert_to_date': ['date'],
                   'start_date': 'date',
                   'configureTime': True,
                   'name': name,
                   'editable': True}

        response = c.post('/importer-api/data-layers/1/configure/', data=json.dumps(payload),
                          content_type='application/json')

        layer = Layer.objects.all()[0]
        self.assertEqual(layer.title, name.replace('-', '_'))

    def test_api_import(self):
        """
        Tests the import api.
        """
        f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
        c = AdminClient()
        c.login_as_non_admin()

        with open(f) as fp:
            response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)

        payload = {'index': 0,
                   'convert_to_date': ['date'],
                   'start_date': 'date',
                   'configureTime': True,
                   'editable': True}

        self.assertTrue(isinstance(UploadLayer.objects.first().configuration_options, dict))

        response = c.get('/importer-api/data-layers/1/')
        self.assertEqual(response.status_code, 200)

        response = c.post('/importer-api/data-layers/1/configure/', data=json.dumps([payload]),
                          content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue('task' in response.content)

        layer = Layer.objects.all()[0]
        self.assertEqual(layer.srid, 'EPSG:4326')
        self.assertEqual(layer.store, self.datastore.name)
        self.assertEqual(layer.storeType, 'dataStore')
        self.assertTrue(layer.attributes[1].attribute_type, 'xsd:dateTime')

        lyr = self.cat.get_layer(layer.name)
        self.assertTrue('time' in lyr.resource.metadata)
        self.assertEqual(UploadLayer.objects.first().layer, layer)
        self.assertTrue(UploadLayer.objects.first().task_id)

    def test_valid_file_extensions(self):
        """
        Test the file extension validator.
        """

        for extension in IMPORTER_VALID_EXTENSIONS:
            self.assertIsNone(validate_file_extension(SimpleUploadedFile('test.{0}'.format(extension), '')))

        with self.assertRaises(ValidationError):
            validate_file_extension(SimpleUploadedFile('test.txt', ''))

    def test_no_geom(self):
        """
        Test the file extension validator.
        """

        with self.assertRaises(ValidationError):
            validate_inspector_can_read(SimpleUploadedFile('test.csv', 'test,loc\nyes,POINT(0,0)'))

        # This should pass (geom type is unknown)
        validate_inspector_can_read(SimpleUploadedFile('test.csv', 'test,WKT\nyes,POINT(0,0)'))

    def test_numeric_overflow(self):
        """
        Regression test for numeric field overflows in shapefiles.
        # https://trac.osgeo.org/gdal/ticket/5241
        """
        self.generic_import('Walmart.zip', configuration_options=[{'index': 0, 'convert_to_date': []}])

    def test_outside_bounds_regression(self):
        """
        Regression where layers with features outside projection bounds fail.
        """
        self.generic_import('Spring_2015.zip', configuration_options=[{'index': 0 }])
        resource = self.cat.get_layer('spring_2015').resource
        self.assertEqual(resource.latlon_bbox, ('-180.0', '180.0', '-90.0', '90.0', 'EPSG:4326'))

    def test_multipolygon_shapefile(self):
        """
        Tests shapefile with multipart polygons.
        """

        self.generic_import('PhoenixFirstDues.zip', configuration_options=[{'index': 0}])

    # def test_geogig_handler(self):
    #     """
    #     Tests the GeoGIG handler.
    #     """
    #     gi = GDALImport(filename=os.path.join(os.path.dirname(__file__), 'test_ogr', 'boxes_with_date.shp'),
    #                     )
    #
    #     # strip out the geoserver handlers until we get the import working
    #     gi._initialize_handlers()
    #     gi._import_handlers = filter(lambda handler: type(handler).__name__ not in ['GeoServerTimeHandler'],
    #                                    gi._import_handlers)
    #
    #     layer = gi.handle(configuration_options=[{'index': 0,
    #                                                'convert_to_date': ['date'],
    #                                                'start_date': 'date',
    #                                                'configureTime': True,
    #                                                'geoserver_store': {
    #                                                    'type': 'GeoGig',
    #                                                    'name': 'test',
    #                                                    'branch': 'master',
    #                                                    'create': 'true',
    #                                                    'geogig_repository': os.path.join(ogc_server_settings.GEOGIG_DATASTORE_DIR, 'testi')
    #                                                }
    #                                                }])
    #
    #
    #     store = self.cat.get_store('test')
    #     self.assertEqual(store.connection_parameters['name'], 'test')
    #     self.assertEqual(store.connection_parameters['create'], 'true')
    #     self.assertEqual(store.connection_parameters['branch'], 'master')
    #     self.assertEqual(store.connection_parameters['type'], 'GeoGig')
    #     self.cat.delete(store, purge=True, recurse=True)
    #
    # def test_geogig_from_api(self):
    #
    #     f = os.path.join(os.path.dirname(__file__), 'test_ogr', 'point_with_date.geojson')
    #     new_user = User.objects.create(username='test')
    #     new_user_perms = ['change_resourcebase_permissions']
    #     c = AdminClient()
    #     c.login_as_non_admin()
    #
    #     with open(f) as fp:
    #         response = c.post(reverse('uploads-new'), {'file': fp}, follow=True)
    #
    #     upload = response.context['object_list'][0]
    #
    #     payload = [{'index': 0,
    #                 'convert_to_date': ['date'],
    #                 'start_date': 'date',
    #                 'configureTime': True,
    #                 'editable': True,
    #                 'geoserver_store': {'type': 'GeoGig'}
    #                 }]
    #
    #     response = c.post('/importer-api/data-layers/{0}/configure/'.format(upload.id), data=json.dumps(payload),
    #                       content_type='application/json')
    #
    #     self.assertTrue(response.status_code, 200)
    #     layer = Layer.objects.all()[0]
    #     self.assertEqual(layer.srid, 'EPSG:4326')
    #     self.assertEqual(layer.store, 'non_admin-storylayers')
    #     self.assertEqual(layer.storeType, 'dataStore')
    #     self.assertEqual(Layer.objects.all()[0].owner.username, self.non_admin_username)


    def test_gwc_handler(self):
        """
        Tests the GeoWebCache handler
        """
        layer = self.generic_import('boxes_with_date.shp', configuration_options=[{'index': 0,
                                                                                   'convert_to_date': ['date'],
                                                                                   'start_date': 'date',
                                                                                   'configureTime': True
                                                                                   }])

        gwc = GeoWebCacheHandler(None)
        gs_layer = self.cat.get_layer(layer.name)

        self.assertTrue(gwc.time_enabled(gs_layer))
        gs_layer.fetch()

        payload = self.cat.http.request(gwc.gwc_url(gs_layer))
        self.assertTrue('regexParameterFilter' in payload[1])
        self.assertEqual(int(payload[0]['status']), 200)

        # Don't configure time, ensure everything still works
        layer = self.generic_import('boxes_with_date_iso_date.shp', configuration_options=[{'index': 0}])
        gs_layer = self.cat.get_layer(layer.name)
        self.cat._cache.clear()
        gs_layer.fetch()

        payload = self.cat.http.request(gwc.gwc_url(gs_layer))
        self.assertFalse('regexParameterFilter' in payload[1])
        self.assertEqual(int(payload[0]['status']), 200)


