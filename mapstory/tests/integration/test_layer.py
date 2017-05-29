from socket import error as socket_error

from django import db

from geonode.geoserver.helpers import gs_catalog
from geoserver.catalog import FailedRequestError

from ..MapStoryTestMixin import MapStoryTestMixin


class LayersCreateTest(MapStoryTestMixin):

    def create_datastore(self, connection, catalog):
        connection_settings = connection.settings_dict
        params = {'database': connection_settings['NAME'],
                  'passwd': connection_settings['PASSWORD'],
                  'namespace': 'http://www.geonode.org/',
                  'type': 'PostGIS',
                  'dbtype': 'postgis',
                  'host': connection_settings['HOST'],
                  'user': connection_settings['USER'],
                  'port': connection_settings['PORT'],
                  'enabled': "True"}

        store = catalog.create_datastore(connection_settings['NAME'], workspace=self.workspace)
        store.connection_parameters.update(params)

        try:
            catalog.save(store)
        except FailedRequestError:
            # assuming this is because it already exists
            pass

        return catalog.get_store(connection_settings['NAME'])

    def setUp(self):

        try:
            # Ensure Geoserver is running.
            assert gs_catalog.about()
        except socket_error as e:
            print(e.__dict__)
            self.skipTest('Geoserver must be running for this test.')

        self.username, self.password = self.create_user('admin', 'admin', is_superuser=True)
        self.non_admin, self.non_admin_password = self.create_user('non_admin', 'non_admin', is_superuser=True)
        self.layer_name = 'testz'
        self.workspace = 'geonode'
        self.postgis = db.connections['datastore']
        self.datastore = self.create_datastore(self.postgis, gs_catalog)

        cursor = self.postgis.cursor()
        cursor.execute("drop domain if exists bigdate cascade;")
        cursor.execute("create domain bigdate as bigint;")

    def tearDown(self):

        layer = gs_catalog.get_layer(self.layer_name)

        if layer:
            gs_catalog.delete(layer)

        if self.datastore:
            gs_catalog.delete(self.datastore, recurse=True)
