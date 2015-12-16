from django import db
from .utils import GDALImport, GDALInspector, configure_time, OGRFieldConverter
from geonode.geoserver.helpers import gs_catalog
from django import db
from geoserver.catalog import FailedRequestError
from geonode.geoserver.helpers import gs_slurp, gs_catalog

class ImportHandler(object):

    def __init__(self, importer, *args, **kwargs):
        self.importer = importer

    def handle(self, layer, layerconfig, *args, **kwargs):
        raise NotImplementedError('Subclass should implement this.')

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Returns true if the configuration has enough information to run the handler.
        """
        return True


class FieldConverterHandler(object):
    """
    Converts fields based on the layer_configuration
    """

    def __init__(self, importer, *args, **kwargs):
        self.importer = importer

    def convert_field_to_time(self, layer, field):
        d = db.connections['datastore'].settings_dict
        connection_string = "PG:dbname='%s' user='%s' password='%s'" % (d['NAME'], d['USER'], d['PASSWORD'])

        with OGRFieldConverter(connection_string) as datasource:
            return datasource.convert_field(layer, field)

    def handle(self, layer, layer_config, *args, **kwargs):
        for field_to_convert in layer_config.get('convert_to_date', []):
            new_field = self.convert_field_to_time(layer, field_to_convert)

            # if the start_date or end_date needed to be converted to a date
            # field, use the newly created field name
            for date_option in ('start_date', 'end_date'):
                if layer_config.get(date_option) == field_to_convert:
                    layer_config[date_option] = new_field.lower()


class GeoNodePublishHandler(ImportHandler):
    """
    Creates a GeoNode Layer from a layer in Geoserver.
    """

    @property
    def store_name(self):
        #TODO: this shouldn't be this dumb
        connection = db.connections['datastore']
        return connection.settings_dict['NAME']

    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Adds a layer in GeoNode, after it has been added to Geoserver.
        """

        if not self.can_run(layer, layer_config):
            return

        return gs_slurp(workspace='geonode', store=self.store_name, filter=layer)


class GeoServerTimeHandler(ImportHandler):
    """
    Enables time in Geoserver for a layer.
    """

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Returns true if the configuration has enough information to run the handler.
        """

        if not all([layer_config.get('configureTime', False), layer_config.get('start_date', None)]):
            return False

        return True

    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Configures time on the object.
        """

        if not self.can_run(layer, layer_config):
            return

        lyr = gs_catalog.get_layer(layer)
        configure_time(lyr.resource, attribute=layer_config.get('start_date'),
                       end_attribute=layer_config.get('end_date'))


class GeoserverPublishHandler(ImportHandler):
    catalog = gs_catalog
    workspace = 'geonode'

    def get_or_create_datastore(self):
        connection = db.connections['datastore']
        settings = connection.settings_dict

        try:
            return self.catalog.get_store(settings['NAME'])
        except FailedRequestError:

            params = {'database': settings['NAME'],
                      'passwd': settings['PASSWORD'],
                      'namespace': 'http://www.geonode.org/',
                      'type': 'PostGIS',
                      'dbtype': 'postgis',
                      'host': settings['HOST'],
                      'user': settings['USER'],
                      'port': settings['PORT'],
                      'enabled': "True"}

            store = self.catalog.create_datastore(settings['NAME'], workspace=self.workspace)
            store.connection_parameters.update(params)
            self.catalog.save(store)

        return self.catalog.get_store(settings['NAME'])

    @property
    def store(self):
        return self.get_or_create_datastore()

    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Publishes a layer to GeoServer.
        """

        if not self.can_run(layer, layer_config):
            return

        self.catalog.publish_featuretype(layer, self.store, 'EPSG:4326')