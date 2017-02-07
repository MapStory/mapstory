from mapstory.settings.base import *

HAYSTACK_SEARCH = True
# Avoid permissions prefiltering
SKIP_PERMS_FILTER = False
# Update facet counts from Haystack
HAYSTACK_FACET_COUNTS = False
HAYSTACK_CONNECTIONS = {
   'default': {
       'ENGINE': 'mapstory.search.elasticsearch_backend.MapStoryElasticsearchSearchEngine',
       'URL': 'http://127.0.0.1:9200/',
       'INDEX_NAME': 'geonode',
       'EXCLUDED_INDEXES': ['geonode.layers.search_indexes.LayerIndex'],
       },
   }
HAYSTACK_SIGNAL_PROCESSOR = 'mapstory.search.signals.RealtimeSignalProcessor'

ENABLE_SOCIAL_LOGIN = False
USE_AWS_S3 = False
GOOGLE_ANALYTICS = 'None'

# OSGEO CONFIG
OSGEO_DATASTORE = 'datastore'

OGC_SERVER = {
    'default': {
        'BACKEND': 'geonode.geoserver',
        'LOCATION': 'http://localhost:8080/geoserver/',
        # PUBLIC_LOCATION needs to be kept like this because in dev mode
        # the proxy won't work and the integration tests will fail
        # the entire block has to be overridden in the local_settings
        'PUBLIC_LOCATION': 'http://localhost:8000/geoserver/',
        'USER': 'admin',
        'PASSWORD': 'geoserver',
        'MAPFISH_PRINT_ENABLED': True,
        'PRINT_NG_ENABLED': True,
        'GEONODE_SECURITY_ENABLED': True,
        'GEOGIG_ENABLED': True,
        'WMST_ENABLED': False,
        'BACKEND_WRITE_ENABLED': True,
        'WPS_ENABLED': True,
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': '',  # 'datastore',
        'TIMEOUT': 10,  # number of seconds to allow for HTTP requests,
        'GEOGIG_DATASTORE_DIR': '/var/lib/geoserver/data/geogig',
        'PG_GEOGIG': True
    }
}
