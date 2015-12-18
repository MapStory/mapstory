from mapstory.settings import *
DATABASE_PASSWORD = 'foobar'
DATABASE_HOST = 'localhost'
OGC_SERVER['default']['PASSWORD'] = 'geoserverer'
OGC_SERVER['default']['PUBLIC_LOCATION'] = 'http://192.168.56.151/geoserver/'
LOCAL_CONTENT = False

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
       },
   }
SKIP_PERMS_FILTER = True
HAYSTACK_SIGNAL_PROCESSOR = 'mapstory.search.signals.RealtimeSignalProcessor'

ENABLE_SOCIAL_LOGIN = True
USE_AWS_S3= False
MAPSTORY_APPS = (

 'mapstory.apps.boxes',
 'provider',
 'provider.oauth2',
 'mapstory.apps.flag', # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)

INSTALLED_APPS += MAPSTORY_APPS


