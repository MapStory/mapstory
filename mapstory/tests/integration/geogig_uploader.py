import uuid

import os

import shutil
from urlparse import urlparse

import httplib2
from django.test.utils import setup_test_environment
from geonode.geoserver.helpers import ogc_server_settings
from geonode.layers.models import Layer
from geoserver.catalog import Catalog
from osgeo_importer.importers import OGRImport
from osgeo_importer.tests.tests_original import setUpModule
from osgeo_importer.utils import ImportHelper
from django.contrib.gis.gdal import DataSource
from django.contrib.auth import get_user_model
import json
from django import db

# This is code mostly taken from the django-osgeo-importer's tests_original.py.
# Its been modified to make mapstory-like integration testing easy plus use
# GeoGig instead of PostGIS (which doesn't work for temporal-data due to problems
# with GetCapabilities and BigDate).
#
# To use;
# subclass this Class (GeoGigUploaderBase) and TestCase
# In your test case - call fully_import_file(...)
#  This will import it into GeoGig + put it in GeoNode, in the same manner
#  when you use the Web GUI to upload a file.
#
# You can import multiple layers by calling fully_import_file() multiple times
#
# NOTE: data is destroyed at the end of each test method (teardown deletes from
#       geoserver and GeoNode).



# User/setUpModule -- taken from django-osgeo-importer's tests_original.py -- see there for details
User = None


def setUpModule():
    """unittest runs this automatically after import, before running tests.

    This function is a place to put code which is needed to set up the global
    test environment, while avoiding side effects at import time and also
    unintended changes to the module namespace.
    """
    # This isn't great but at least it's explicit and confined to User.
    global User
    setup_test_environment()
    User = get_user_model()


# Subclass this to make writing integration test cases easier!
class GeoGigUploaderBase(ImportHelper):
    def __init__(self, *args, **kwargs):
        super(GeoGigUploaderBase, self).__init__(*args, **kwargs)
        setUpModule()  # this isn't available when being used in other module

    def setUp(self):
        self.admin_user = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin_user = self.create_user('non_admin', 'non_admin')
        self.catalog = Catalog(
            ogc_server_settings.internal_rest,
            *ogc_server_settings.credentials
        )
        if self.catalog.get_workspace('geonode') is None:
            self.catalog.create_workspace('geonode', 'http://www.geonode.org/')
        self.workspace = 'geonode'
        self.datastoreNames = []

    def tearDown(self):
        """Clean up geoserver/geogig catalog.
        """
        # delete stores (will cascade to delete layers)
        for store_name in self.datastoreNames:
            self.catalog.delete(self.catalog.get_store(store_name), recurse=True)

        # delete repository reference in geoserver
        for store_name in self.datastoreNames:
            self.remove_geogig_repo(store_name)

        # geoserver can leave connections open - HACK HACK HACK
        self.free_geogig_connections()

    # HACK HACK HACK -- sometimes connections from geoserver to geogig are left open.  This kills the postgresql backend!
    #  this is a major hammer.  Once geoserver/geogig are better at cleaning up, remove this.
    def free_geogig_connections(self):
        with db.connections["geogig"].cursor() as c:
            c.execute(
                "select pg_terminate_backend(pid) from pg_stat_activity where application_name = 'PostgreSQL JDBC Driver' or application_name='geogig'")

    # aggressive delete of the repo (mostly cleans up after itself)
    #  call the geogig rest API DELETE
    def remove_geogig_repo(self, ref_name):
        username = ogc_server_settings.credentials.username
        password = ogc_server_settings.credentials.password
        url = ogc_server_settings.rest
        http = httplib2.Http(disable_ssl_certificate_validation=False)
        http.add_credentials(username, password)
        netloc = urlparse(url).netloc
        http.authorizations.append(
            httplib2.BasicAuthentication(
                (username, password),
                netloc,
                url,
                {},
                None,
                None,
                http
            ))
        rest_url = ogc_server_settings.LOCATION + "geogig/repos/" + ref_name + "/delete.json"
        resp, content = http.request(rest_url, 'GET')
        response = json.loads(content)
        token = response["response"]["token"]
        rest_url = ogc_server_settings.LOCATION + "geogig/repos/" + ref_name + "?token=" + token
        resp, content = http.request(rest_url, 'DELETE')

    # convenience method to load in the test dataset
    # return a (geonode) layer
    # the layer will be in Geoserver and Geonode
    # self.catalog.get_layer(layer.name) -- to get the Geoserver Layer
    def fully_import_file(self, path, fname, start_time_column, end_time_column=None):
        # setup time
        if end_time_column is None:
            time_config = {'convert_to_date': [start_time_column], 'start_date': start_time_column,
                           'configureTime': True}
        else:
            time_config = {'convert_to_date': [start_time_column, end_time_column], 'start_date': start_time_column,
                           'end_date': end_time_column, 'configureTime': True}

        name = os.path.splitext(fname)[0] + "_" + str(uuid.uuid1())[:8]
        self.datastoreNames.append(name)  # remember for future deletion

        full_fname = os.path.join(path, fname)
        configs = self.prepare_file_for_import(full_fname)
        configs[0].update({'name': name})
        configs[0].update({'layer_name': name})
        configs[0].update(time_config)

        # configure the datastore/repo
        configs[0]['geoserver_store'] = {}
        configs[0]['geoserver_store']['type'] = 'geogig'
        configs[0]['geoserver_store']['name'] = name
        configs[0]['geoserver_store']['create'] = 'true'
        configs[0]['geoserver_store']['branch'] = 'master'
        configs[0]['geoserver_store']['geogig_repository'] = "geoserver://" + name

        result = self.generic_import(fname, path=path, configs=configs)
        return result

    def import_file(self, path, configs=None):
        """Imports the file.
        """
        if configs is None:
            configs = []
        self.assertTrue(os.path.exists(path), path)

        # run ogr2ogr
        ogr = OGRImport(path)
        layers = ogr.handle(configuration_options=configs)

        return layers

    def generic_import(self, filename, path, configs=None):
        if configs is None:
            configs = [{'index': 0}]

        path = os.path.join(path, filename)
        results = self.import_file(path, configs=configs)
        layer_results = []
        for result in results:
            layer = Layer.objects.get(name=result[0])
            self.assertEqual(layer.srid, 'EPSG:4326')
            self.assertTrue(layer.store in self.datastoreNames)
            self.assertEqual(layer.storeType, 'dataStore')

            if not path.endswith('zip'):
                self.assertGreaterEqual(
                    layer.attributes.count(),
                    DataSource(path)[0].num_fields
                )

            layer_results.append(layer)

        return layer_results[0]

    def prepare_file_for_import(self, filepath):
        """ Prepares the file path provided for import; performs some housekeeping, uploads & configures the file.
            Returns a list of dicts of the form {'index': <layer_index>, 'upload_layer_id': <upload_layer_id>}
                these may be used as configuration options for importing all of the layers in the file.
        """
        # Make a copy of the test file, as it's removed in configure_upload()
        filename = os.path.basename(filepath)
        tmppath = os.path.join('/tmp', filename)
        shutil.copy(filepath, tmppath)

        # upload & configure_upload expect closed file objects
        #    This is heritage from originally being closely tied to a view passing request.Files
        of = open(tmppath, 'rb')
        of.close()
        files = [of]
        uploaded_data = self.upload(files, self.admin_user)
        self.configure_upload(uploaded_data, files)
        configs = [{'index': l.index, 'upload_layer_id': l.id} for l in uploaded_data.uploadlayer_set.all()]
        return configs

    def create_user(self, username, password, **kwargs):
        """Convenience method for creating users.
        """
        user, created = User.objects.get_or_create(username=username, **kwargs)

        if created:
            user.set_password(password)
            user.save()

        return user
