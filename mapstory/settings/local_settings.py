from kombu import Queue
from .local_key import *

MEDIA_ROOT = '/var/lib/mapstory/media/'
DATABASE_PASSWORD = 'foobar'
DATABASE_HOST = 'localhost'
OGC_SERVER['default']['PASSWORD'] = 'geoserver'
OGC_SERVER['default']['PUBLIC_LOCATION'] = 'http://192.168.56.151/geoserver/'
OGC_SERVER['default']['LOCATION'] = 'http://192.168.56.151/geoserver/'
OGC_SERVER['default']['PG_GEOGIG'] = True
LOCAL_CONTENT = False

SITEURL='http://192.168.56.151'

DEBUG = True
SESSION_COOKIE_DOMAIN = '192.168.56.151'

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


MAPSTORY_APPS = (

 'mapstory.apps.boxes',
 'mapstory.apps.flag', # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)

# Social Authentication Settings

ENABLE_SOCIAL_LOGIN = False

SOCIAL_AUTH_FACEBOOK_KEY = ''
SOCIAL_AUTH_FACEBOOK_SECRET = ''
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    'fields': 'id,name,email',
}

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = ''
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = ''

# Registration Settings

REGISTRATION_OPEN = True
ACCOUNT_OPEN_SIGNUP = True
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "auth_login"
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = False
ACCOUNT_ACTIVATION_DAYS = 0
DEFAULT_FROM_EMAIL = ''
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/'
ACCOUNT_LOGIN_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/'

# Google Analytics Settings
GOOGLE_ANALYTICS = 'testing'

# Email Settings
THEME_ACCOUNT_CONTACT_EMAIL = ''
EMAIL_HOST = ''
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 25
EMAIL_USE_TLS = False
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Slack Settings

SLACK_BACKEND = 'django_slack.backends.RequestsBackend'
SLACK_TOKEN = ''
SLACK_CHANNEL = ''
SLACK_ICON_EMOJI = ''
SLACK_USERNAME = ''


# AWS S3 Settings

USE_AWS_S3_STATIC = False
USE_AWS_S3_MEDIA = False

# Required to run Sync Media to S3
AWS_BUCKET_NAME = ''

AWS_STORAGE_BUCKET_NAME = ''
AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
AWS_S3_BUCKET_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME

INSTALLED_APPS += MAPSTORY_APPS

BROKER_URL = "amqp://mapstory:password@localhost/mapstory"

CELERY_DEFAULT_QUEUE = "default"
CELERY_DEFAULT_EXCHANGE = "default"
CELERY_DEFAULT_EXCHANGE_TYPE = "direct"
CELERY_DEFAULT_ROUTING_KEY = "default"
CELERY_CREATE_MISSING_QUEUES = True

CELERY_ALWAYS_EAGER = False  # False makes tasks run asynchronously

CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERY_IGNORE_RESULT=False

OSGEO_DATASTORE = 'datastore'
