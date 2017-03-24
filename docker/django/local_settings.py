from kombu import Queue
#from .local_key import *
import os

def str_to_bool(v):
  return v.lower() in ("yes", "true", "t", "1")

MEDIA_ROOT = os.environ['MEDIA_ROOT']
STATIC_ROOT = os.environ['STATIC_ROOT']
DATABASE_PASSWORD = os.environ['DATABASE_PASSWORD']
DATABASE_HOST = os.environ['DATABASE_HOST']
OGC_SERVER['default']['PASSWORD'] = os.environ['GEOSERVER_PASSWORD']
OGC_SERVER['default']['PUBLIC_LOCATION'] = "%s://%s/geoserver/" % (os.environ['PUBLIC_PROTOCOL'], os.environ['PUBLIC_HOST'])
OGC_SERVER['default']['LOCATION'] = "%s://%s:%d/geoserver/" % (os.environ['PRIVATE_PROTOCOL'], os.environ['GEOSERVER_HOST_INTERNAL'], int(os.environ['GEOSERVER_PORT_INTERNAL']))
OGC_SERVER['default']['PG_GEOGIG'] = True
LOCAL_CONTENT = False
THEME = os.environ.get('THEME', 'default')

SITE_ID = 1
SITEURL = "%s://%s" % (os.environ['PUBLIC_PROTOCOL'], os.environ['PUBLIC_HOST'])

DEBUG = str_to_bool(os.environ.get('DEBUG', 'False'))
if not DEBUG:
    ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '')
if os.environ['PUBLIC_HOST'].replace('.', '').isdigit():
    # IP Address
    SESSION_COOKIE_DOMAIN = os.environ['PUBLIC_HOST']
else:
    # Domain name, hopefully
    SESSION_COOKIE_DOMAIN = ".%s" % (os.environ['PUBLIC_HOST'],)

HAYSTACK_SEARCH = True
# Avoid permissions prefiltering
SKIP_PERMS_FILTER = False
# Update facet counts from Haystack
HAYSTACK_FACET_COUNTS = False
HAYSTACK_URL = "%s://%s:%d" % (os.environ['PRIVATE_PROTOCOL'], os.environ['ELASTIC_HOST'], int(os.environ['ELASTIC_PORT']))
HAYSTACK_CONNECTIONS = {
   'default': {
       'ENGINE': 'mapstory.search.elasticsearch_backend.MapStoryElasticsearchSearchEngine',
       'URL': HAYSTACK_URL,
       'INDEX_NAME': 'geonode',
       'EXCLUDED_INDEXES': ['geonode.layers.search_indexes.LayerIndex'],
       },
   }
SKIP_PERMS_FILTER = True
HAYSTACK_SIGNAL_PROCESSOR = 'mapstory.search.signals.RealtimeSignalProcessor'


MAPSTORY_APPS = (

 'mapstory.apps.boxes',
 'mapstory.apps.flag', # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)

# Social Authentication Settings

ENABLE_SOCIAL_LOGIN = str_to_bool(os.environ['ENABLE_SOCIAL_LOGIN'])
if ENABLE_SOCIAL_LOGIN:
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/'

    INSTALLED_APPS += (
        'social.apps.django_app.default',
        'provider',
        'provider.oauth2',
    )

    AUTHENTICATION_BACKENDS += (
        'social.backends.google.GoogleOAuth2',
        'social.backends.facebook.FacebookOAuth2',
    )

DEFAULT_AUTH_PIPELINE = (
    'social.pipeline.social_auth.social_details',
    'social.pipeline.social_auth.social_uid',
    'social.pipeline.social_auth.auth_allowed',
    'social.pipeline.social_auth.social_user',
    'social.pipeline.user.get_username',
    'social.pipeline.mail.mail_validation',
    'social.pipeline.social_auth.associate_by_email',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details'
)

SOCIAL_AUTH_FACEBOOK_KEY = os.environ.get('FACEBOOK_APP_ID','')
SOCIAL_AUTH_FACEBOOK_SECRET = os.environ.get('FACEBOOK_APP_SECRET','')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    'fields': 'id,name,email',
}

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get('GOOGLE_OATH2_CLIENT_ID','')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('GOOGLE_OATH2_CLIENT_SECRET','')

# Registration Settings

REGISTRATION_OPEN = True
ACCOUNT_OPEN_SIGNUP = True
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "auth_login"
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = str_to_bool(os.environ['ACCOUNT_EMAIL_CONFIRMATION_REQUIRED'])
ACCOUNT_ACTIVATION_DAYS = int(os.environ.get('ACCOUNT_ACTIVATION_DAYS', '0'))
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', '')
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/'
ACCOUNT_LOGIN_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/'

# Google Analytics Settings

GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')

# Email Settings
THEME_ACCOUNT_CONTACT_EMAIL = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '25'))
EMAIL_USE_TLS = str_to_bool(os.environ.get('EMAIL_USE_TLS', 'false'))
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

# Slack Settings

SLACK_BACKEND = os.environ.get('SLACK_BACKEND', 'django_slack.backends.RequestsBackend')
SLACK_TOKEN = os.environ.get('SLACK_TOKEN', '')
SLACK_CHANNEL = os.environ.get('SLACK_CHANNEL', '')
SLACK_ICON_EMOJI = os.environ.get('SLACK_ICON_EMOJI', '')
SLACK_USERNAME = os.environ.get('SLACK_USERNAME', '')


# AWS S3 Settings

USE_AWS_S3_STATIC = False
USE_AWS_S3_MEDIA = False

# Required to run Sync Media to S3
AWS_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME' ,'')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME','')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID','')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY','')
AWS_S3_BUCKET_DOMAIN = '%s.s3.amazonaws.com' % (AWS_STORAGE_BUCKET_NAME,)

INSTALLED_APPS += MAPSTORY_APPS

BROKER_URL = "amqp://mapstory:%s@%s/%s" % (os.environ['RABBITMQ_APPLICATION_PASSWORD'], os.environ['RABBITMQ_HOST'], os.environ['RABBITMQ_APPLICATION_VHOST'])

CELERY_DEFAULT_QUEUE = "default"
CELERY_DEFAULT_EXCHANGE = "default"
CELERY_DEFAULT_EXCHANGE_TYPE = "direct"
CELERY_DEFAULT_ROUTING_KEY = "default"
CELERY_CREATE_MISSING_QUEUES = True

CELERY_ALWAYS_EAGER = False  # False makes tasks run asynchronously

CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERY_IGNORE_RESULT = False

OSGEO_DATASTORE = 'datastore'

USER_SNAP = True
