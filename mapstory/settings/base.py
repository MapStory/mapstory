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
from geonode.settings import *
import pyproj

#
# General Django development settings
#

SITENAME = 'MapStory'
SITEURL = "%s://%s" % (os.environ['PUBLIC_PROTOCOL'], os.environ['PUBLIC_HOST'])

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
    'geonode',
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
    'notification',
    'mapstory.apps.health_check_geoserver',
    'mapstory.apps.thumbnails',
    'mapstory.storypins',
    'mapstory.apps.journal',
    'mapstory.apps.favorite',
    'mapstory.apps.teams',
    'mapstory.apps.organizations',
    'mapstory.apps.initiatives',
    'mapstory.mapstory_profile',
    'mapstory.mapstories',
    'health_check',
    'health_check.db',
    'health_check.cache',
    'health_check.storage',
    'health_check.contrib.celery',
    'health_check.contrib.s3boto_storage',
)
# DO NOT REMOVE (read commment above)
INSTALLED_APPS += (
    'mapstory.apps.activities',
    'actstream',
)
# Thanks !

MAPSTORY_APPS = (

    'mapstory.apps.storyframes',
    'mapstory.apps.flag', # - temporarily using this instead of the flag app for django because they need to use AUTH_USER_MODEL

)

INSTALLED_APPS += MAPSTORY_APPS

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
            os.path.join(LOCAL_ROOT, 'apps/initiatives'),
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
                'account.context_processors.account',
                'geonode.context_processors.resource_urls',
                'geonode.geoserver.context_processors.geoserver_urls',
                'mapstory.context_processors.context',
                'user_messages.context_processors.user_messages'
            ],
        },
    },
]

#
# Database Settings
#
DATABASE_HOST = os.environ['DATABASE_HOST']
DATABASE_PASSWORD = os.environ['DATABASE_PASSWORD']
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
GEOSERVER_LOCATION = "%s://%s:%d/geoserver/" % (os.environ['PRIVATE_PROTOCOL'], os.environ['GEOSERVER_HOST_INTERNAL'], int(os.environ['GEOSERVER_PORT_INTERNAL']))
GEOSERVER_PUBLIC_LOCATION = "%s://%s/geoserver/" % (os.environ['PUBLIC_PROTOCOL'], os.environ['PUBLIC_HOST'])

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
        'USER': 'admin',
        'PASSWORD': os.environ['GEOSERVER_PASSWORD'],
        'MAPFISH_PRINT_ENABLED': True,
        'PRINT_NG_ENABLED': True,
        'GEONODE_SECURITY_ENABLED': True,
        'GEOGIG_ENABLED': True,
        'WMST_ENABLED': False,
        'BACKEND_WRITE_ENABLED': True,
        'WPS_ENABLED': True,
        'LOG_FILE': '%s/geoserver/data/logs/geoserver.log'
        % os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir)),
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': 'geogig',
        'TIMEOUT': 10,  # number of seconds to allow for HTTP requests,
        'GEOGIG_DATASTORE_DIR': '/var/lib/geoserver/data/geogig',
        'PG_GEOGIG': True
    }
}


def str_to_bool(v):
    return v.lower() in ("yes", "true", "t", "1")


#
# Email Settings
#
ACCOUNT_ACTIVATION_DAYS = int(os.environ.get('ACCOUNT_ACTIVATION_DAYS', '0'))
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/'
ACCOUNT_EMAIL_CONFIRMATION_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = str_to_bool(os.environ['ACCOUNT_EMAIL_CONFIRMATION_REQUIRED'])
ACCOUNT_LOGIN_REDIRECT_URL = '/'
ACCOUNT_OPEN_SIGNUP = True
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', '')
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '25'))
EMAIL_USE_TLS = str_to_bool(os.environ.get('EMAIL_USE_TLS', 'false'))
THEME_ACCOUNT_CONTACT_EMAIL = os.environ.get('EMAIL_HOST_USER', '')

#
# AWS S3 Settings
#
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID','')
AWS_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME' ,'')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME','')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY','')
AWS_S3_BUCKET_DOMAIN = '%s.s3.amazonaws.com' % (AWS_STORAGE_BUCKET_NAME,)
USE_AWS_S3_STATIC = False
USE_AWS_S3_MEDIA = False

if USE_AWS_S3_STATIC:
    STATICFILES_LOCATION = 'static'
    STATICFILES_STORAGE = 'mapstory.s3_storages.StaticStorage'
    STATIC_URL = "https://%s/%s/" % (AWS_S3_BUCKET_DOMAIN, STATICFILES_LOCATION)
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
    'permissions': {'users':{'AnonymousUser':['change_layer_data', 'download_resourcebase', 'view_resourcebase']}, 'groups':{'registered':['change_layer_style']}}
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

# @todo remove this hack once maploom can deal with other config
# have to put this after local_settings or any adjustments to OGC_SERVER will
# not get picked up
MAP_BASELAYERS = [
    {
        "source": {
            "ptype": "gxp_wmscsource",
            # Setting lazy=True will prevent MapLoom from making a getCapabilities request until
            # the user tries to add a layer.
            # See https://github.com/ROGUE-JCTD/MapLoom/commit/d7ea83d17b4e17150f02a0c9e94a79c3592297c2.
            "lazy": True,
            "url": OGC_SERVER['default']['PUBLIC_LOCATION'] + "wms",
            "restUrl": "/gs/rest",
            "name": "local geoserver"
        }
    },
    {
        "source": {"ptype": "gxp_olsource"},
        "type": "OpenLayers.Layer",
        "args": ["No background"],
        "visibility": False,
        "fixed": True,
        "group": "background"
    },
    {
        "source": {"ptype": "gxp_osmsource"},
        "type": "OpenLayers.Layer.OSM",
        "args": ["OpenStreetMap"],
        "name": 'mapnik',
        'title': 'OpenStreetMap',
        "visibility": False,
        "fixed": True,
        "group": "background"
    },
    {
        "source": {"ptype": "gxp_osmsource"},
        "type": "OpenLayers.Layer.OSM",
        "args": ["Humanitarian OpenStreetMap", [
            "//a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png",
            "//b.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png",
            "//c.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png"
        ], {"tileOptions": {"crossOriginKeyword": None}}
                 ],
        'title': 'Humanitarian OpenStreetMap',
        'name': "hot",
        "visibility": False,
        "fixed": True,
        "group": "background"
    },
    {
        "source": {"ptype": "gxp_olsource"},
        "type": "OpenLayers.Layer.WMS",
        "group": "background",
        "visibility": False,
        "fixed": True,
        "args": [
            "Naked Earth",
            "//maps.opengeo.org/geowebcache/service/wms",
            {
                "layers": ["Wayne"],
                "format": "image/png",
                "tiled": True,
                "tilesOrigin": [-20037508.34, -20037508.34]
            },
            {"buffer": 0}
        ]
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'natural-earth-1',
        'title': 'Natural Earth',
        'group': 'background'
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'natural-earth-2',
        'title': 'Natural Earth 2',
        'group': 'background'
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'geography-class',
        'title': 'Geography Class',
        'group': 'background'
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'control-room',
        'title': 'MapBoxControlRoom',
        'group': 'background'
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'world-dark',
        'title': 'World Dark',
        'group': 'background'
    },
    {
        'source': {
            'ptype': 'gxp_mapboxsource',
            'hidden': True
        },
        'name': 'world-light',
        'title': 'World Light',
        'group': 'background'
    }
]

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
BROKER_URL = "amqp://mapstory:%s@%s/%s" % (os.environ['RABBITMQ_APPLICATION_PASSWORD'], os.environ['RABBITMQ_HOST'], os.environ['RABBITMQ_APPLICATION_VHOST'])
CELERY_ALWAYS_EAGER = str_to_bool(os.environ.get('CELERY_ALWAYS_EAGER', 'False'))  # False makes tasks run asynchronously
CELERY_DEFAULT_QUEUE = "default"
CELERY_DEFAULT_EXCHANGE = "default"
CELERY_DEFAULT_EXCHANGE_TYPE = "direct"
CELERY_DEFAULT_ROUTING_KEY = "default"
CELERY_CREATE_MISSING_QUEUES = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = str_to_bool(os.environ.get('CELERY_EAGER_PROPAGATES_EXCEPTIONS', 'False'))
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERY_IGNORE_RESULT = False

#
# Haystack Settings
#
HAYSTACK_SEARCH = True
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

#
# Social Authentication Settings
#
ENABLE_SOCIAL_LOGIN = str_to_bool(os.environ['ENABLE_SOCIAL_LOGIN'])
if ENABLE_SOCIAL_LOGIN:
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/'

    INSTALLED_APPS += (
        'social.apps.django_app.default',
        'provider',
        'provider.oauth2',
    )

    AUTHENTICATION_BACKENDS = (
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

GEOFENCE_SECURITY_ENABLED = False

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
if not DEBUG:
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
        "elasticsearch": {
            "handlers": ["console"], "level": "ERROR", },
        "osgeo_importer": {
            "handlers": ["console"], "level": "DEBUG", },
    },
}

#
# Slack Settings
#
SLACK_BACKEND = os.environ.get('SLACK_BACKEND', 'django_slack.backends.RequestsBackend')
SLACK_TOKEN = os.environ.get('SLACK_TOKEN', '')
SLACK_CHANNEL = os.environ.get('SLACK_CHANNEL', '')
SLACK_ICON_EMOJI = os.environ.get('SLACK_ICON_EMOJI', '')
SLACK_USERNAME = os.environ.get('SLACK_USERNAME', '')

#
# Misc Settings
#
REGISTRATION_OPEN = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
AUTOCOMPLETE_QUICK_SEARCH = False
THEME = os.environ.get('THEME', 'default')
USER_SNAP = True
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')
LOCAL_CONTENT = False

# Override number of results per page listed in the GeoNode search pages
CLIENT_RESULTS_LIMIT = 30

# Download formats available in layer detail download modal
DOWNLOAD_FORMATS_VECTOR = [
    'Zipped Shapefile', 'GML 2.0', 'GML 3.1.1', 'CSV', 'GeoJSON', 'KML',
]

MESSAGE_STORAGE = 'django.contrib.messages.storage.session.SessionStorage'

SCHEMA_DOWNLOAD_EXCLUDE = [
    'FID',
    'ogc_fid',
    'date_xd',
    'date_parsed',
]

#
# Feature toggles
#
FEATURE_MULTIPLE_STORY_CHAPTERS = str_to_bool(os.environ.get('FEATURE_MULTIPLE_STORY_CHAPTERS', 'False'))

# Choose thumbnail generator -- this is the delayed phantomjs generator
THUMBNAIL_GENERATOR = "mapstory.apps.thumbnails.tasks.create_gs_thumbnail_mapstory_tx_aware"
