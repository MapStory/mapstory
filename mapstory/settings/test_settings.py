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

