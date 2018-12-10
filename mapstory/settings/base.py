# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2012 OpenPlans
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

#
# Django settings for the GeoNode project.
#
import logging
import os
import sys

import geonode
import pyproj
from geonode.settings import *
# from mapstory.models import Baselayer, DefaultBaselayer


def str_to_bool(v):
    return v.lower() in ("yes", "true", "t", "1")


def is_valid(v):
    if v and len(v) > 0:
        return True
    else:
        return False


#
# General Django development settings
#
SITENAME = os.environ.get('SITE_NAME', 'MapStory')
SITEURL = "%s://%s" % (os.environ.get('PUBLIC_PROTOCOL', 'https'),
                       os.environ.get('PUBLIC_HOST', 'ERROR'))

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

WSGI_APPLICATION = "mapstory.wsgi.application"

STATICFILES_DIRS = [
    os.path.join(LOCAL_ROOT, "static"),
] + STATICFILES_DIRS

MEDIA_ROOT = os.environ['MEDIA_ROOT']
STATIC_ROOT = os.environ['STATIC_ROOT']


# Location of url mappings
ROOT_URLCONF = 'mapstory.urls'

# Location of locale files
LOCALE_PATHS = (
    os.path.join(LOCAL_ROOT, 'locale'),
) + LOCALE_PATHS

#
# Site Customizations
#

# Branding
SITE_NAME = SITENAME
BRANDING_STORY_NAME = os.environ.get('BRANDING_STORY_NAME', 'MapStory')
BRANDING_STORIES_NAME = os.environ.get('BRANDING_STORIES_NAME', 'MapStories')
BRANDING_LAYER_NAME = os.environ.get('BRANDING_LAYER_NAME', 'StoryLayer')
BRANDING_LAYERS_NAME = os.environ.get('BRANDING_LAYERS_NAME', 'StoryLayers')
THEME = os.environ.get('THEME', 'default')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')

# Misc
ACCOUNT_OPEN_SIGNUP = str_to_bool(os.environ.get('REGISTRATION_OPEN', 'True'))
ENABLE_FORM_LOGIN = str_to_bool(os.environ.get('ENABLE_FORM_LOGIN', 'True'))
USER_SNAP = str_to_bool(os.environ.get('USER_SNAP', 'False'))
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')
SESSION_EXPIRE_AT_BROWSER_CLOSE = os.environ.get('SESSION_EXPIRE_AT_BROWSER_CLOSE', 'False')

#
# Application Settings
#
# This removes actstream in order to add it at the end of installed apps.
# This is recommended by the actstream docs:
# http://django-activity-stream.readthedocs.io/en/latest/installation.html#basic-app-configuration
installed_apps_list = list(INSTALLED_APPS)
installed_apps_list.remove('actstream')
INSTALLED_APPS = tuple(installed_apps_list)
INSTALLED_APPS += (
    'django_nose',
    'mapstory',
    'django.contrib.webdesign',
    'geonode.contrib.geogig',
    'icon_commons',
    'maploom',
    'haystack',
    'mailer',
    'django_slack',
    'fluent_comments',
    'crispy_forms',
    'threadedcomments',
    'django_comments',
    'osgeo_importer',
    'solo',
    'coverage',
    'django_classification_banner',
    'mapstory.thumbnails',
    'mapstory.journal',
    'mapstory.favorite',
    'mapstory.teams',
    'mapstory.organizations',
    'mapstory.initiatives',
    'mapstory.mapstory_profile',
    'mapstory.mapstories',
    'mapstory.storylayers',
)

if is_valid(os.getenv("ALLAUTH_GEOAXIS_HOST")):
    INSTALLED_APPS += (
        'mapstory.socialaccount.providers.geoaxis',
    )

MAPSTORY_APPS = (

    'mapstory.flag',  # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)

INSTALLED_APPS += MAPSTORY_APPS

# DO NOT REMOVE (read commment above)
INSTALLED_APPS += (
    'mapstory.activities',
    'actstream',
)
# Thanks !

#
# Template Settings
#
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(LOCAL_ROOT, 'templates'),
            os.path.join(os.path.dirname(geonode.__file__), 'templates'),
            os.path.join('deps/story-tools-composer', 'partials'),
            os.path.join(LOCAL_ROOT, 'initiatives'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.core.context_processors.debug',
                'django.core.context_processors.i18n',
                'django.core.context_processors.tz',
                'django.core.context_processors.media',
                'django.core.context_processors.static',
                'django.core.context_processors.request',
                'django.contrib.messages.context_processors.messages',
                'geonode.context_processors.resource_urls',
                'geonode.geoserver.context_processors.geoserver_urls',
                'mapstory.context_processors.context',
                'django_classification_banner.context_processors.classification',
                'django.template.context_processors.request',
            ],
        },
    },
]

#
# Authentication Settings
#
ACCOUNT_ADAPTER = os.environ.get(
    'ACCOUNT_ADAPTER', 'mapstory.mapstory_profile.views.MapStoryAccountAdapter')
ACCOUNT_FORMS = {'signup': 'mapstory.mapstory_profile.forms.CustomSignupForm'}
ACCOUNT_EXTRA_PROFILE_FORM = os.environ.get(
    'ACCOUNT_EXTRA_PROFILE_FORM', 'EditMapstoryProfileForm')

AUTHENTICATION_BACKENDS = (
    'oauth2_provider.backends.OAuth2Backend',

    # Needed to login by username in Django admin, regardless of `allauth`
    'django.contrib.auth.backends.ModelBackend',

    # Required and used by geonode for object permissions
    'guardian.backends.ObjectPermissionBackend',

    # `allauth` specific authentication methods, such as login by e-mail
    'allauth.account.auth_backends.AuthenticationBackend',
)

OAUTH2_PROVIDER = {
    'SCOPES': {
        'read': 'Read scope',
        'write': 'Write scope',
        'groups': 'Access to your groups'
    },

    'CLIENT_ID_GENERATOR_CLASS': 'oauth2_provider.generators.ClientIdGenerator',
}

GEOFENCE_SECURITY_ENABLED = True

# authorized exempt urls
ADDITIONAL_AUTH_EXEMPT_URLS = os.getenv('ADDITIONAL_AUTH_EXEMPT_URLS', ())

if isinstance(ADDITIONAL_AUTH_EXEMPT_URLS, str):
    ADDITIONAL_AUTH_EXEMPT_URLS = tuple(
        map(str.strip, ADDITIONAL_AUTH_EXEMPT_URLS.split(',')))

AUTH_EXEMPT_URLS = ('/capabilities', '/complete/*', '/login/*',
                    '/api/o/*', '/api/roles', '/api/adminRole',
                    '/api/users', '/o/token/*', '/o/authorize/*',
                    ) + ADDITIONAL_AUTH_EXEMPT_URLS

#
# Database Settings
#
DATABASE_HOST = os.environ.get('DATABASE_HOST', 'ERROR')
DATABASE_PASSWORD = os.environ.get('DATABASE_PASSWORD', 'ERROR')
DATABASE_PORT = '5432'

if DATABASE_PASSWORD:
    DATABASES = {
        'default': {
            # we use transaction_hooks so we can attach on_commit actions
            'ENGINE': 'transaction_hooks.backends.postgresql_psycopg2',
            'NAME': 'mapstory',
            'USER': 'mapstory',
            'PASSWORD': DATABASE_PASSWORD,
            'HOST': DATABASE_HOST,
            'PORT': '5432',
        },
        'datastore': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': 'mapstory_data',
            'USER': 'mapstory',
            'PASSWORD': DATABASE_PASSWORD,
            'HOST': DATABASE_HOST,
            'PORT': '5432',
        },
        'geogig': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'mapstory_geogig',
            'USER': 'mapstory',
            'PASSWORD': DATABASE_PASSWORD,
            'HOST': DATABASE_HOST,
            'PORT': '5432',
        }
    }

    UPLOADER = {
        'BACKEND': 'geonode.importer',
        'OPTIONS': {
            'TIME_ENABLED': True,
            'GEOGIG_ENABLED': True,
        }
    }

    USE_BIG_DATE = True

    GEOGIG_DATASTORE_NAME = 'geogig'

#
# Geoserver Settings
#
GEOSERVER_LOCATION = "%s://%s:%d/geoserver/" % (
    os.environ.get('PRIVATE_PROTOCOL', 'http'), os.environ.get('GEOSERVER_HOST_INTERNAL', 'ERROR'), int(os.environ.get('GEOSERVER_PORT_INTERNAL', '8000')))
GEOSERVER_PUBLIC_LOCATION = "%s://%s/geoserver/" % (
    os.environ.get('PUBLIC_PROTOCOL', 'https'), os.environ.get('PUBLIC_HOST', 'ERROR'))

GEOSERVER_USER = os.environ.get('GEOSERVER_USER', 'admin')
GEOSERVER_PASSWORD = os.environ.get('GEOSERVER_PASSWORD', 'geoserver')
GEOSERVER_LOG = '%s/geoserver/data/logs/geoserver.log' % os.path.abspath(
    os.path.join(PROJECT_ROOT, os.pardir))
GEOGIG_DATASTORE_DIR = '/var/lib/geoserver/data/geogig'

OGC_SERVER = {
    'default': {
        'BACKEND': 'geonode.geoserver',
        'LOCATION': GEOSERVER_LOCATION,
        'LOGIN_ENDPOINT': 'j_spring_oauth2_geonode_login',
        'LOGOUT_ENDPOINT': 'j_spring_oauth2_geonode_logout',
        # PUBLIC_LOCATION needs to be kept like this because in dev mode
        # the proxy won't work and the integration tests will fail
        # the entire block has to be overridden in the local_settings
        'PUBLIC_LOCATION': GEOSERVER_PUBLIC_LOCATION,
        'USER': GEOSERVER_USER,
        'PASSWORD': GEOSERVER_PASSWORD,
        'MAPFISH_PRINT_ENABLED': True,
        'PRINT_NG_ENABLED': True,
        'GEONODE_SECURITY_ENABLED': True,
        'GEOFENCE_SECURITY_ENABLED': GEOFENCE_SECURITY_ENABLED,
        'GEOGIG_ENABLED': True,
        'WMST_ENABLED': False,
        'BACKEND_WRITE_ENABLED': True,
        'WPS_ENABLED': True,
        'LOG_FILE': GEOSERVER_LOG,
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': 'geogig',
        'TIMEOUT': 10,  # number of seconds to allow for HTTP requests,
        'GEOGIG_DATASTORE_DIR': GEOGIG_DATASTORE_DIR,
        'PG_GEOGIG': True
    }
}

AUTH_IP_WHITELIST = []

GEOFENCE = {
    'url': os.environ.get('GEOFENCE_URL', '%s/geofence' % GEOSERVER_LOCATION.strip('/')),
    'username': os.environ.get('GEOFENCE_USERNAME', GEOSERVER_USER),
    'password': os.environ.get('GEOFENCE_PASSWORD', GEOSERVER_PASSWORD)
}


#
# Email Settings
#
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/'
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_EMAIL_VERIFICATION = os.environ.get(
    'ACCOUNT_EMAIL_VERIFICATION', 'none')
ACCOUNT_LOGIN_REDIRECT_URL = '/'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', '')
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '25'))
EMAIL_USE_TLS = str_to_bool(os.environ.get('EMAIL_USE_TLS', 'false'))
THEME_ACCOUNT_CONTACT_EMAIL = os.environ.get('EMAIL_HOST_USER', '')

#
# AWS S3 Settings
#
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
AWS_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
AWS_S3_BUCKET_DOMAIN = '%s.s3.amazonaws.com' % (AWS_STORAGE_BUCKET_NAME,)
USE_AWS_S3_STATIC = False
USE_AWS_S3_MEDIA = False

if USE_AWS_S3_STATIC:
    STATICFILES_LOCATION = 'static'
    STATICFILES_STORAGE = 'mapstory.s3_storages.StaticStorage'
    STATIC_URL = "https://%s/%s/" % (AWS_S3_BUCKET_DOMAIN,
                                     STATICFILES_LOCATION)
    REMOTE_CONTENT_URL = STATIC_URL + 'assets'

if USE_AWS_S3_MEDIA:
    MEDIAFILES_LOCATION = 'media'
    MEDIA_URL = "https://%s/%s/" % (AWS_S3_BUCKET_DOMAIN, MEDIAFILES_LOCATION)
    DEFAULT_FILE_STORAGE = 'mapstory.s3_storages.MediaStorage'

#
# Django OSGEO Importer Settings
#
IMPORT_HANDLERS = (
    'mapstory.import_handlers.TruncatedNameHandler',
    'osgeo_importer.handlers.BigDateFieldConverterHandler',
    'osgeo_importer.handlers.geoserver.GeoserverPublishHandler',
    'osgeo_importer.handlers.geoserver.GeoServerBoundsHandler',
    'osgeo_importer.handlers.geoserver.GeoServerTimeHandler',
    'osgeo_importer.handlers.geoserver.GeoWebCacheHandler',
    'osgeo_importer.handlers.geonode.GeoNodePublishHandler',
    'mapstory.import_handlers.LayerAppendHandler'
)

OSGEO_IMPORTER_GEONODE_ENABLED = True
OSGEO_DATASTORE = 'datastore'
# Soft time limit for the import_object celery task of django_osgeo_importer, should be changed later after testing.
IMPORT_TASK_SOFT_TIME_LIMIT = 1800
PROJECTION_DIRECTORY = os.path.join(os.path.dirname(pyproj.__file__), 'data/')

DEFAULT_IMPORTER_CONFIG = {
    'configureTime': True,
    'editable': True,
    'convert_to_date': [],
    'always_geogig': True,
    'index': 0,
    'permissions': {'users': {'AnonymousUser': ['change_layer_data', 'download_resourcebase', 'view_resourcebase']}, 'groups': {'registered': ['change_layer_style']}}
}

# Append only needs to import to temporarily store changes, so we turn off editable and the geogig history.
DEFAULT_APPEND_CONFIG = {
    'configureTime': True,
    'editable': False,
    'convert_to_date': [],
    'always_geogig': False,
    'index': 0
}

# the layer_create view allows users to create layer by providing a workspace and a featureType
# this settings whitelists the datastores in which layers creation are allowed
ALLOWED_DATASTORE_LAYER_CREATE = ('*',)

#
# Avatar Settings
#
AVATAR_DEFAULT_URL = "%s/static/mapstory/img/default_avatar_lg.png" % SITEURL
AVATAR_GRAVATAR_BACKUP = False
AVATAR_GRAVATAR_SSL = True
AUTO_GENERATE_AVATAR_SIZES = (35, 45, 75, 100)

#
# Celery Settings
#
CELERY_BROKER_URL = "amqp://mapstory:%s@%s/%s" % (
    os.environ.get('RABBITMQ_APPLICATION_PASSWORD', 'ERROR'), os.environ.get('RABBITMQ_HOST', 'ERROR'), os.environ.get('RABBITMQ_APPLICATION_VHOST', 'ERROR'))
CELERY_TASK_ALWAYS_EAGER = str_to_bool(os.environ.get(
    'CELERY_TASK_ALWAYS_EAGER', 'False'))  # False makes tasks run asynchronously
CELERY_TASK_DEFAULT_QUEUE = "default"
CELERY_TASK_DEFAULT_EXCHANGE = "default"
CELERY_TASK_DEFAULT_EXCHANGE_TYPE = "direct"
CELERY_TASK_DEFAULT_ROUTING_KEY = "default"
CELERY_TASK_CREATE_MISSING_QUEUES = True
CELERY_TASK_EAGER_PROPAGATES = str_to_bool(
    os.environ.get('CELERY_TASK_EAGER_PROPAGATES', 'False'))
CELERY_RESULT_BACKEND = 'db+postgresql://mapstory:%s@%s:%s/mapstory' % (
    DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT)
CELERY_TASK_IGNORE_RESULT = False
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']

#
# Haystack Settings
#
HAYSTACK_SEARCH = True
# Update facet counts from Haystack
HAYSTACK_FACET_COUNTS = False
HAYSTACK_URL = "%s://%s:%d" % (os.environ.get('PRIVATE_PROTOCOL', 'http'),
                               os.environ.get('ELASTIC_HOST', 'ERROR'), int(os.environ.get('ELASTIC_PORT', '9200')))
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

#
# Activity Stream Settings
#
SITE_ID = 1
ACTSTREAM_SETTINGS = {
    'FETCH_RELATIONS': True,
    'USE_PREFETCH': False,
    'USE_JSONFIELD': True,
    'GFK_FETCH_DEPTH': 1,
}
#
# Threaded Comment Settings
#
FLUENT_COMMENTS_EXCLUDE_FIELDS = ('name', 'email', 'url', 'title')
COMMENTS_APP = 'fluent_comments'

#
# Automated Testing Settings
#


class DisableMigrations(object):
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return "notmigrations"


# Disable migrations only on tests
TESTS_IN_PROGRESS = False
if 'test' in sys.argv[1:] or 'jenkins' in sys.argv[1:]:
    logging.disable(logging.CRITICAL)
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )
    DEBUG = False
    TEMPLATE_DEBUG = False
    TESTS_IN_PROGRESS = True
    MIGRATION_MODULES = DisableMigrations()

# Setup django-nose as our test runner and have it provide us with HTML coverage reports generated in the cover folder.
TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
# TESTS NEED TO BE RUN WITH ./test.sh for coverage to work!!!
# https://stackoverflow.com/questions/24668174/how-to-test-coverage-properly-with-django-nose
# Nose Test arguments. Will not find and run tests unless --exe is specified.
# Nose-runner has issues with coverage reporting and model loading.
# https://github.com/django-nose/django-nose/issues/180
# Coverage options are now specified in `.coveragerc`
NOSE_ARGS = [
    '--exe',
    # This:
    '--ignore-files=(^\.|^_|pavement\.py$|fabfile\.py$|local_settings\.py$|cf\.py$|search_indexes\.py$)',
    # Is not the same as this:
    # '--exclude=(^\.|^_|pavement\.py$|fabfile\.py$|_settings\.py$|cf\.py$|search_indexes\.py$)',
    '--all-modules',
    '--traverse-namespace',
    # FOR DEBUGGING:
    # '--detailed-errors',
    # '--with-id',
    # '--pdb',
    # '--verbosity=3',
    # '--stop',
]

#
# Debug Settings
#
DEBUG_STATIC = True
DEBUG = str_to_bool(os.environ.get('DEBUG', 'False'))
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split('|')
SESSION_COOKIE_DOMAIN = None

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(message)s',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'null': {
            'level': 'ERROR',
            'class': 'django.utils.log.NullHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'mail_admins': {
            'level': 'ERROR', 'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
        },
        'slack_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django_slack.log.SlackExceptionHandler'
        }
    },
    "loggers": {
        "django": {
            "handlers": ["console", "slack_admins"], "level": "ERROR", },
        "mapstory": {
            "handlers": ["console"], "level": "ERROR", },
        "gsconfig.catalog": {
            "handlers": ["console"], "level": "ERROR", },
        "owslib": {
            "handlers": ["console"], "level": "ERROR", },
        "pycsw": {
            "handlers": ["console"], "level": "ERROR", },
        "celery": {
            "handlers": ["console"], "level": "INFO", },
        "elasticsearch": {
            "handlers": ["console"], "level": "ERROR", },
        "osgeo_importer": {
            "handlers": ["console"], "level": "DEBUG", },
    },
}

#
# Slack Settings
#
SLACK_BACKEND = os.environ.get(
    'SLACK_BACKEND', 'django_slack.backends.RequestsBackend')
SLACK_TOKEN = os.environ.get('SLACK_TOKEN', '')
SLACK_CHANNEL = os.environ.get('SLACK_CHANNEL', '')
SLACK_ICON_EMOJI = os.environ.get('SLACK_ICON_EMOJI', '')
SLACK_USERNAME = os.environ.get('SLACK_USERNAME', '')

#
# Misc Settings
#
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
AUTOCOMPLETE_QUICK_SEARCH = False
LOCAL_CONTENT = False

# Override number of results per page listed in the GeoNode search pages
CLIENT_RESULTS_LIMIT = 30

# Available download formats
DOWNLOAD_FORMATS_METADATA = [
    'Atom', 'DIF', 'Dublin Core', 'ebRIM', 'FGDC', 'ISO',
]
DOWNLOAD_FORMATS_VECTOR = [
    'JPEG', 'PDF', 'PNG', 'Zipped Shapefile', 'GML 2.0', 'GML 3.1.1', 'CSV',
    'Excel', 'GeoJSON', 'KML', 'View in Google Earth', 'Tiles',
    'QGIS layer file (.qlr)',
    'QGIS project file (.qgs)',
]
DOWNLOAD_FORMATS_RASTER = [
    'JPEG',
    'PDF',
    'PNG',
    'ArcGrid',
    'GeoTIFF',
    'Gtopo30',
    'ImageMosaic',
    'KML',
    'View in Google Earth',
    'Tiles',
    'GML',
    'GZIP',
    'QGIS layer file (.qlr)',
    'QGIS project file (.qgs)',
    'Zipped All Files'
]

MESSAGE_STORAGE = 'django.contrib.messages.storage.session.SessionStorage'

SCHEMA_DOWNLOAD_EXCLUDE = [
    'FID',
    'ogc_fid',
    'date_xd',
    'date_parsed',
]

# Choose thumbnail generator -- this is the delayed phantomjs generator
THUMBNAIL_GENERATOR = "mapstory.thumbnails.tasks.create_gs_thumbnail_mapstory_tx_aware"

#
# Classification banner
#
CLASSIFICATION_BANNER_ENABLED = str_to_bool(
    os.getenv('CLASSIFICATION_BANNER_ENABLED', 'False'))
CLASSIFICATION_FOOTER_ENABLED = str_to_bool(
    os.getenv('CLASSIFICATION_FOOTER_ENABLED', 'False'))
CLASSIFICATION_TEXT = os.getenv('CLASSIFICATION_TEXT', 'UNCLASSIFIED//FOUO')
CLASSIFICATION_TEXT_COLOR = os.getenv('CLASSIFICATION_TEXT_COLOR', 'white')
CLASSIFICATION_BACKGROUND_COLOR = os.getenv(
    'CLASSIFICATION_BACKGROUND_COLOR', 'green')
CLASSIFICATION_LINK = os.getenv('CLASSIFICATION_LINK', None)

#
# Login warning
#
LOGIN_WARNING_ENABLED = str_to_bool(
    os.getenv('LOGIN_WARNING_ENABLED', 'False'))
if LOGIN_WARNING_ENABLED:
    LOGIN_WARNING_TEXT = os.getenv(
        'LOGIN_WARNING_TEXT',
        '''<p>You are accessing a U.S. Government (USG) Information System
         (IS) that is provided for USG-authorized use only.  By using this
         IS (which includes any device attached to this IS), you consent to
         the following conditions:</p><ul><li>The USG routinely intercepts,
         and monitors communications on this IS for purposes including, but
         not limited to, penetration testing, COMSEC monitoring, network
         operations and defense, personnel misconduct (PM), law enforcement
         (LE), and counterintelligence (CI) investigations.</li><li>At any
         time, the USG may inspect and seize data stored on this IS.</li>
         <li>Communications using, or data stored on, this IS are not
         private, are subject to routine monitoring, interception, and search,
         and may be disclosed or used for any USG-authorized purpose.</li>
         </ul><p>This IS includes security measures (e.g., authentication and
         access controls) to protect USG interests -- not for your personal
         benefit or privacy.  Notwithstanding the above, using this IS does
         not constitute consent to PM, LE, or CI investigative searching or
         monitoring of the content of privileged communications, or work
         product, related to personal representation or services by attorneys,
         psychotherapists, or clergy, and their assistants. Such
         communications and work product are private and confidential.
         See User Agreement for details.</p>''')

#
# Feature toggles
#
FEATURE_MULTIPLE_STORY_CHAPTERS = str_to_bool(
    os.environ.get('FEATURE_MULTIPLE_STORY_CHAPTERS', 'False'))

X_FRAME_OPTIONS = 'ALLOWALL'

# audit settings
AUDIT_ENABLED = str_to_bool(os.getenv('AUDIT_ENABLED', 'False'))
if AUDIT_ENABLED:
    INSTALLED_APPS = INSTALLED_APPS + (
        'mapstory.audit',
    )

    AUDIT_TO_FILE = str_to_bool(os.getenv('AUDIT_TO_FILE', 'False'))
    AUDIT_LOGFILE_LOCATION = os.getenv(
        'AUDIT_LOGFILE_LOCATION',
        os.path.join(LOCAL_ROOT, 'audit_log.json')
    )
