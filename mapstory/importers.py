import time
import json
import requests

from django.conf import settings
from django.http import HttpResponseForbidden
from django.utils.text import slugify

from geonode.geoserver.helpers import ogc_server_settings
from geonode.upload.utils import create_geoserver_db_featurestore
from osgeo_importer.importers import Import
from osgeo_importer.utils import UploadError, launder
from osgeo_importer.api import UploadedLayerResource


class UploadedLayerResource(UploadedLayerResource):

    def clean_configuration_options(self, request, obj, configuration_options):

        if configuration_options.get('geoserver_store'):
            store = configuration_options.get('geoserver_store')
            if store.get('type', str).lower() == 'geogig':
                store.setdefault('branch', 'master')
                store.setdefault('create', 'true')
                store.setdefault('name', slugify(configuration_options.get('name')))
                store['geogig_repository'] = ("geoserver://%s" % store.get('name'))

        if not configuration_options.get('layer_owner'):
            configuration_options['layer_owner'] = obj.upload.user.username

        return configuration_options


class GeoServerLayerCreator(Import):
    upload_file = None
    handlers_to_ignore = ['GeoserverPublishHandler']

    def _initialize_handlers(self):
        super(GeoServerLayerCreator, self)._initialize_handlers()
        self._import_handlers = filter(lambda handler: type(handler).__name__ not in self.handlers_to_ignore,
                                       self._import_handlers)

    def import_file(self, *args, **kwargs):
        """
        Creates a Geoserver Layer from JSON.

        {
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
        """
        self.completed_layers = []
        configuration_options = kwargs.get('configuration_options')

        if not configuration_options:
            return

        # Configuration options should be a list at this point since the importer can process multiple layers in a
        # single import
        if isinstance(configuration_options, dict):
            configuration_options = [configuration_options]

        for layer in configuration_options:
            feature_type = layer.get('featureType')
            store_name = feature_type['store']['name']
            store_create_geogig = layer.get(u'storeCreateGeogig', 'false')
            owner = layer.get('layer_owner')
            username = owner.username
            email = owner.email
            layer['layer_type'] = 'vector'
            layer['fields'] = None
            layer['geoserver_store'] = {'type': 'geogig'}
            store = layer.get('geoserver_store')
            if store.get('type', str).lower() == 'geogig':
                name = slugify(feature_type['name'])
                store.setdefault('branch', 'master')
                store.setdefault('create', 'true')
                store.setdefault('name', name)
                store['geogig_repository'] = ("geoserver://%s" % name)
                store_name = name

            feature_type['title'] = feature_type['name']
            feature_type['name'] = launder(slugify(unicode(feature_type['name'])))

            # Without this check, the bounding box will default to 0, 0, -1, -1
            if 'nativeBoundingBox' not in feature_type:
                feature_type['nativeBoundingBox'] = {'minx': -180, 'maxx': 180, 'miny': -90, 'maxy': 90, 'crs': 'EPSG:4326'}

            if store_create_geogig and store_create_geogig != 'false':
                store_created = create_geoserver_db_featurestore(store_type='geogig', store_name=store_name, author_name=username,
                                                                 author_email=email)
                feature_type['store']['name'] = store_created.name

            if store_name not in getattr(settings, 'ALLOWED_DATASTORE_LAYER_CREATE', []) and '*' not in getattr(settings, 'ALLOWED_DATASTORE_LAYER_CREATE', []):
                return HttpResponseForbidden(content='Datastore specified in featureType is not in the ALLOWED_DATASTORE_LAYER_CREATE whitelist.')

            for x in range(0, 50):
                post_request = requests.post(
                    '{}/workspaces/{}/datastores/{}/featuretypes.json'.format(ogc_server_settings.rest, feature_type['namespace']['name'], store_name),
                    data='{{"featureType":{}}}'.format(json.dumps(feature_type)),
                    auth=ogc_server_settings.credentials,
                    headers={'content-type': 'application/json'}
                )
                if post_request.ok:
                    break
                if 'already exists in' in post_request.content:
                    break
                time.sleep(3)

            if post_request.ok:
                self.completed_layers.append([feature_type['name'], layer])
            else:
                message = 'Unable to create layer: {0}, an unhandled exception occurred.'.format(feature_type['name'])

                if 'already exists in' in post_request.content:
                    message = 'A layer named {0} already exists.  Please choose another name.'.format(feature_type['name'])
                print post_request.content
                raise UploadError(message)

        return self.completed_layers
