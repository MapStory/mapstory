from kombu import Queue
from .local_key import *

MEDIA_ROOT = '{{media_root}}'
DATABASE_PASSWORD = '{{ pgpass }}'
DATABASE_HOST = '{{ database_host }}'
OGC_SERVER['default']['PASSWORD'] = '{{ gspass }}'
OGC_SERVER['default']['PUBLIC_LOCATION'] = 'http://{{ nginx_server_name }}/geoserver/'
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


MAPSTORY_APPS = (

 'mapstory.apps.boxes',
 'mapstory.apps.flag', # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)


# Social Authentication Settings

ENABLE_SOCIAL_LOGIN = {{ enable_social_login }}
TWITTER_CONSUMER_KEY = '{{twitter_consumer_key }}'
TWITTER_CONSUMER_SECRET = '{{ twitter_consumer_secret }}'

FACEBOOK_APP_ID = '{{ facebook_app_id }}'
FACEBOOK_API_SECRET = '{{ facebook_api_secret }}'
FACEBOOK_EXTENDED_PERMISSIONS = ['email']

GOOGLE_OAUTH2_CLIENT_ID = '{{ google_oauth2_client_id }}'
GOOGLE_OAUTH2_CLIENT_SECRET = '{{ google_oauth2_client_secret }}'

# Registration Settings

REGISTRATION_OPEN = {{ registration_open }}
ACCOUNT_OPEN_SIGNUP = {{ account_open_signup }}
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "auth_login"
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = {{ account_email_confirmation_required }}
ACCOUNT_ACTIVATION_DAYS = {{ account_activation_days }}
DEFAULT_FROM_EMAIL = '{{ default_from_email }}'

# Google Analytics Settings

GOOGLE_ANALYTICS = '{{ google_analytics }}'

# Email Settings

EMAIL_HOST = '{{ email_host }}'
EMAIL_HOST_USER = '{{ email_host_user }}'
EMAIL_HOST_PASSWORD = '{{ email_host_password }}'
EMAIL_PORT = {{ email_port }}
EMAIL_USE_TLS = {{ email_use_tls }}
EMAIL_BACKEND = "{{ email_backend }}"

# Slack Settings

SLACK_BACKEND = '{{ slack_backend }}'
SLACK_TOKEN = '{{ slack_token }}'
SLACK_CHANNEL = '{{ slack_channel }}'
SLACK_ICON_EMOJI = '{{ slack_icon_emoji }}'
SLACK_USERNAME = '{{ slack_username }}'


# AWS S3 Settings

USE_AWS_S3 = {{ use_aws_s3 }}

AWS_STORAGE_BUCKET_NAME = '{{ aws_storage_bucket_name }}'
AWS_ACCESS_KEY_ID = '{{ aws_access_key_id }}'
AWS_SECRET_ACCESS_KEY = '{{ aws_secret_access_key }}'

INSTALLED_APPS += MAPSTORY_APPS

BROKER_URL = "amqp://{{ rabbitmq_application_user }}:{{ rabbitmq_application_password }}@localhost/{{ rabbitmq_application_vhost }}"

CELERY_ALWAYS_EAGER = False # Makes tasks run synchronously

CELERY_DEFAULT_QUEUE = "default"
CELERY_DEFAULT_EXCHANGE = "default"
CELERY_DEFAULT_EXCHANGE_TYPE = "direct"
CELERY_DEFAULT_ROUTING_KEY = "default"
CELERY_CREATE_MISSING_QUEUES = True
CELERY_ALWAYS_EAGER = False
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERY_IGNORE_RESULT=False