import requests
from .utils import configure_time
from .inspectors import OGRFieldConverter
from decimal import Decimal, InvalidOperation
from django import db
from django.conf import settings
from geonode.geoserver.helpers import gs_slurp, gs_catalog
from geonode.upload.utils import create_geoserver_db_featurestore
from geoserver.catalog import FailedRequestError


DEFAULT_IMPORT_HANDLERS = ['mapstory.importer.handlers.FieldConverterHandler',
                           'mapstory.importer.handlers.GeoserverPublishHandler',
                           'mapstory.importer.handlers.GeoServerTimeHandler',
                           'mapstory.importer.handlers.GeoNodePublishHandler']

IMPORT_HANDLERS = getattr(settings, 'IMPORT_HANDLERS', DEFAULT_IMPORT_HANDLERS)

def ensure_can_run(func):
    """
    Convenience decorator that executes the "can_run" method class and returns the function if the can_run is True.
    """

    def func_wrapper(self, *args, **kwargs):

        if self.can_run(*args, **kwargs):
            return func(self, *args, **kwargs)

    return func_wrapper


class ImportHandler(object):

    def __init__(self, importer, *args, **kwargs):
        self.importer = importer

    @ensure_can_run
    def handle(self, layer, layerconfig, *args, **kwargs):
        raise NotImplementedError('Subclass should implement this.')

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Returns true if the configuration has enough information to run the handler.
        """
        return True


class FieldConverterHandler(ImportHandler):
    """
    Converts fields based on the layer_configuration.
    """

    def convert_field_to_time(self, layer, field):
        d = db.connections['datastore'].settings_dict
        connection_string = "PG:dbname='%s' user='%s' password='%s' host='%s' port='%s'" % (d['NAME'], d['USER'],
                                                                        d['PASSWORD'], d['HOST'], d['PORT'])

        with OGRFieldConverter(connection_string) as datasource:
            return datasource.convert_field(layer, field)

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        for field_to_convert in set(layer_config.get('convert_to_date', [])):

            if not field_to_convert:
                continue

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

    workspace = 'geonode'

    @property
    def store_name(self):

        geoserver_publishers = self.importer.filter_handler_results('GeoserverPublishHandler')

        for result in geoserver_publishers:
            for key, feature_type in result.items():
                if feature_type and hasattr(feature_type, 'store'):
                    return feature_type.store.name

        return db.connections['datastore'].settings_dict['NAME']

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Skips this layer if the user is appending data to another dataset.
        """
        return 'appendTo' not in layer_config

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Adds a layer in GeoNode, after it has been added to Geoserver.

        Handler specific params:
        "layer_owner": Sets the owner of the layer.
        """

        return gs_slurp(workspace=self.workspace,
                        store=self.store_name,
                        filter=layer,
                        owner=layer_config.get('layer_owner'),
                        permissions=layer_config.get('permissions')
                        )


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

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Configures time on the object.

        Handler specific params:
        "configureTime": Must be true for this handler to run.
        "start_date": Passed as the start time to Geoserver.
        "end_date" (optional): Passed as the end attribute to Geoserver.
        """

        lyr = gs_catalog.get_layer(layer)
        configure_time(lyr.resource, attribute=layer_config.get('start_date'),
                       end_attribute=layer_config.get('end_date'))


class GeoserverPublishHandler(ImportHandler):
    catalog = gs_catalog
    workspace = 'geonode'
    srs = 'EPSG:4326'

    def get_default_store(self):
        connection = db.connections['datastore']
        settings = connection.settings_dict

        return {
              'database': settings['NAME'],
              'passwd': settings['PASSWORD'],
              'namespace': 'http://www.geonode.org/',
              'type': 'PostGIS',
              'dbtype': 'postgis',
              'host': settings['HOST'],
              'user': settings['USER'],
              'port': settings['PORT'],
              'enabled': 'True',
              'name': settings['NAME']
        }

    def get_or_create_datastore(self, layer_config):
        connection_string = layer_config.get('geoserver_store', self.get_default_store())

        try:
            return self.catalog.get_store(connection_string['name'])
        except FailedRequestError:
            store = self.catalog.create_datastore(connection_string['name'], workspace=self.workspace)
            store.connection_parameters.update(connection_string)
            self.catalog.save(store)

        return self.catalog.get_store(connection_string['name'])

    def geogig_handler(self, store, layer, layer_config):

        repo = store.connection_parameters['geogig_repository']
        auth = (self.catalog.username, self.catalog.password)
        repo_url = self.catalog.service_url.replace('/rest', '/geogig/{0}/'.format(repo))
        transaction = requests.get(repo_url + 'beginTransaction.json', auth=auth)
        transaction_id = transaction.json()['response']['Transaction']['ID']
        params = self.get_default_store()
        params['password'] = params['passwd']
        params['table'] = layer
        params['transactionId'] = transaction_id

        import_command = requests.get(repo_url + 'postgis/import.json', params=params, auth=auth)
        task = import_command.json()['task']

        status = 'NOT RUN'
        while status != 'FINISHED' and status != 'FAILED':
            check_task = requests.get(task['href'], auth=auth)
            status = check_task.json()['task']['status']

        if check_task.json()['task']['status'] == 'FINISHED':
            requests.get(repo_url + 'add.json', params={'transactionId': transaction_id}, auth=auth)
            requests.get(repo_url + 'commit.json', params={'transactionId': transaction_id}, auth=auth)
            requests.get(repo_url + 'endTransaction.json', params={'transactionId': transaction_id}, auth=auth)


    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Publishes a layer to GeoServer.

        Handler specific params:
        "geoserver_store": Connection parameters used to get/create the geoserver store.
        """
        store = self.get_or_create_datastore(layer_config)

        if getattr(store, 'type', '').lower() == 'geogig':
            self.geogig_handler(store, layer, layer_config)

        return self.catalog.publish_featuretype(layer, self.get_or_create_datastore(layer_config), self.srs)


class GeoWebCacheHandler(ImportHandler):
    """
    Configures GeoWebCache for a layer in Geoserver.
    """
    catalog = gs_catalog
    workspace = 'geonode'

    @staticmethod
    def config(**kwargs):
        return """<?xml version="1.0" encoding="UTF-8"?>
            <GeoServerLayer>
              <name>{name}</name>
              <enabled>true</enabled>
              <mimeFormats>
                <string>image/png</string>
                <string>image/jpeg</string>
                <string>image/png8</string>
              </mimeFormats>
              <gridSubsets>
                <gridSubset>
                  <gridSetName>EPSG:900913</gridSetName>
                </gridSubset>
                <gridSubset>
                  <gridSetName>EPSG:4326</gridSetName>
                </gridSubset>
                <gridSubset>
                  <gridSetName>EPSG:3857</gridSetName>
                </gridSubset>
              </gridSubsets>
              <metaWidthHeight>
                <int>4</int>
                <int>4</int>
              </metaWidthHeight>
              <expireCache>0</expireCache>
              <expireClients>0</expireClients>
              <parameterFilters>
                {regex_parameter_filter}
                <styleParameterFilter>
                  <key>STYLES</key>
                  <defaultValue/>
                </styleParameterFilter>
              </parameterFilters>
              <gutter>0</gutter>
            </GeoServerLayer>""".format(**kwargs)

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Only run this handler if the layer is found in Geoserver.
        """
        self.layer = self.catalog.get_layer(layer)

        if self.layer:
            return True

        return

    @staticmethod
    def time_enabled(layer):
        """
        Returns True is time is enabled for a Geoserver layer.
        """
        return 'time' in (getattr(layer.resource, 'metadata', []) or [])

    def gwc_url(self, layer):
        """
        Returns the GWC URL given a Geoserver layer.
        """

        return self.catalog.service_url.replace('rest', 'gwc/rest/layers/{workspace}:{layer_name}.xml'.format(
            workspace=layer.resource.workspace.name, layer_name=layer.name))

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Adds a layer to GWC.
        """
        regex_filter = ""
        time_enabled = self.time_enabled(self.layer)

        if time_enabled:
            regex_filter = """
                <regexParameterFilter>
                  <key>TIME</key>
                  <defaultValue/>
                  <regex>.*</regex>
                </regexParameterFilter>
                """

        return self.catalog.http.request(self.gwc_url(self.layer), method="POST",
                                         body=self.config(regex_parameter_filter=regex_filter, name=self.layer.name))


class GeoServerBoundsHandler(ImportHandler):
    """
    Sets the lat/long bounding box of a layer to the max extent of WGS84 if the values of the current lat/long
    bounding box fail the Decimal quantize method (which Django uses internally when validating decimals).

    This can occur when the native bounding box contain Infinity values.
    """

    catalog = gs_catalog
    workspace = 'geonode'

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Only run this handler if the layer is found in Geoserver.
        """
        self.catalog._cache.clear()
        self.layer = self.catalog.get_layer(layer)

        if self.layer:
            return True

        return

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        resource = self.layer.resource

        try:
            for dec in map(Decimal, resource.latlon_bbox[:4]):
                dec.quantize(1)

        except InvalidOperation:
            resource.latlon_bbox = ['-180', '180', '-90', '90', 'EPSG:4326']
            self.catalog.save(resource)