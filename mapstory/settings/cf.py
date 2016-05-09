from mapstory.settings import *
import dj_database_url
import json

ENV_VARIABLES = json.loads(os.environ['VCAP_SERVICES'])

DEBUG_STATIC = False

DEBUG = True

DATABASES = {
    'default': dj_database_url.config(),
}

HAYSTACK_SEARCH = True
# Avoid permissions prefiltering
SKIP_PERMS_FILTER = False
# Update facet counts from Haystack
HAYSTACK_FACET_COUNTS = False
HAYSTACK_CONNECTIONS = {
   'default': {
       'ENGINE': 'mapstory.search.elasticsearch_backend.MapStoryElasticsearchSearchEngine',
       'URL': ENV_VARIABLES['searchly'][0]['credentials']['sslUri'],
       'INDEX_NAME': 'geonode',
       },
   }
SKIP_PERMS_FILTER = True
HAYSTACK_SIGNAL_PROCESSOR = 'mapstory.search.signals.RealtimeSignalProcessor'