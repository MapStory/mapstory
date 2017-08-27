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

# Django settings for the GeoNode project.
import logging
import os
import sys

from geonode.settings import *
import pyproj

#
# General Django development settings
#

SITENAME = 'MapStory'

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

WSGI_APPLICATION = "mapstory.wsgi.application"

STATICFILES_DIRS = [
                       os.path.join(LOCAL_ROOT, "static"),
                   ] + STATICFILES_DIRS

STATIC_ROOT = os.path.join(LOCAL_ROOT, "static_root")
MEDIA_ROOT = os.path.join(LOCAL_ROOT, "uploaded")


# Location of url mappings
ROOT_URLCONF = 'mapstory.urls'

# Location of locale files
LOCALE_PATHS = (
                   os.path.join(LOCAL_ROOT, 'locale'),
               ) + LOCALE_PATHS

# Defines settings for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(LOCAL_ROOT, 'development.db'),
    },
}

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
    'mapstory.apps.collections',
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
    'resizeimage',
    'coverage',
    'notification',
    'mapstory.apps.health_check_geoserver',
    'mapstory.apps.thumbnails',
    'mapstory.annotations',
    'mapstory.apps.journal',
    'mapstory.apps.favorite',
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

# Adding Threaded Comments app
FLUENT_COMMENTS_EXCLUDE_FIELDS = ('name', 'email', 'url', 'title')
COMMENTS_APP = 'fluent_comments'


# Note that Django automatically includes the "templates" dir in all the
# INSTALLED_APPS, se there is no need to add maps/templates or admin/templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(LOCAL_ROOT, 'templates')],
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

OGC_SERVER = {
    'default': {
        'BACKEND': 'geonode.geoserver',
        'LOCATION': 'http://localhost:8080/geoserver/',
        'LOGIN_ENDPOINT': 'j_spring_oauth2_geonode_login',
        'LOGOUT_ENDPOINT': 'j_spring_oauth2_geonode_logout',
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
        'LOG_FILE': '%s/geoserver/data/logs/geoserver.log'
        % os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir)),
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': '',  # 'datastore',
        'TIMEOUT': 10,  # number of seconds to allow for HTTP requests,
        'GEOGIG_DATASTORE_DIR': '/var/lib/geoserver/data/geogig',
        'PG_GEOGIG': True
    }
}

DEBUG_STATIC = True

REGISTRATION_OPEN = True

LOCAL_CONTENT = False

DATABASE_PASSWORD = None
DATABASE_HOST = 'localhost'
DATABASE_PORT = '5432'

AUTOCOMPLETE_QUICK_SEARCH = False

ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
ACCOUNT_EMAIL_CONFIRMATION_EMAIL = True

USE_AWS_S3_STATIC = False
USE_AWS_S3_MEDIA = False

IMPORT_HANDLERS = (
    'mapstory.import_handlers.TruncatedNameHandler',
    'osgeo_importer.handlers.BigDateFieldConverterHandler',
    'osgeo_importer.handlers.geoserver.GeoserverPublishHandler',
    'osgeo_importer.handlers.geoserver.GeoServerBoundsHandler',
    'osgeo_importer.handlers.geoserver.GeoServerTimeHandler',
    'osgeo_importer.handlers.geoserver.GeoWebCacheHandler',
    'osgeo_importer.handlers.geonode.GeoNodePublishHandler',
    'osgeo_importer.handlers.geoserver.GenericSLDHandler',
    'mapstory.import_handlers.LayerAppendHandler'
)

OSGEO_IMPORTER_GEONODE_ENABLED = True

if os.path.exists('mapstory/settings/local_settings.py'):
    exec open('mapstory/settings/local_settings.py') in globals()

# Download formats available in layer detail download modal
DOWNLOAD_FORMATS_VECTOR = [
    'Zipped Shapefile', 'GML 2.0', 'GML 3.1.1', 'CSV', 'GeoJSON', 'KML',
]

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
    ## remove esri basemap until supported by storytools
    ##    {
    ##        "source": {"ptype": "gxp_arcrestsource",
    ##                   "url": "https://services.arcgisonline.com/arcgis/rest/services/NGS_Topo_US_2D/MapServer/",
    ##                   "alwaysAnonymous": True,
    ##                   'proj': 'EPSG:4326'},
    ##        "type": "OpenLayers.Layer",
    ##        "args": ["Worldmap", "https://services.arcgisonline.com/arcgis/rest/services/NGS_Topo_US_2D/MapServer/",
    ##                 {"layers": 'basic'}],
    ##        "visibility": False,
    ##        "fixed": True,
    ##        "group": "background",
    ##        "name": "NGS_Topo_US_2D",
    ##        "title": "Esri NGS"
    ##    },
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

if DATABASE_PASSWORD:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
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

    OGC_SERVER['default']['DATASTORE'] = 'geogig'

    UPLOADER = {
        'BACKEND': 'geonode.importer',
        'OPTIONS': {
            'TIME_ENABLED': True,
            'GEOGIG_ENABLED': True,
        }
    }

    USE_BIG_DATE = True

    GEOGIG_DATASTORE_NAME = 'geogig'

SCHEMA_DOWNLOAD_EXCLUDE = [
    'FID',
    'ogc_fid',
    'date_xd',
    'date_parsed',
]

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

if USE_AWS_S3_STATIC:
    STATICFILES_LOCATION = 'static'
    STATICFILES_STORAGE = 'mapstory.s3_storages.StaticStorage'
    STATIC_URL = "https://%s/%s/" % (AWS_S3_BUCKET_DOMAIN, STATICFILES_LOCATION)

if USE_AWS_S3_MEDIA:
    MEDIAFILES_LOCATION = 'media'
    MEDIA_URL = "https://%s/%s/" % (AWS_S3_BUCKET_DOMAIN, MEDIAFILES_LOCATION)
    DEFAULT_FILE_STORAGE = 'mapstory.s3_storages.MediaStorage'

REMOTE_CONTENT_URL = STATIC_URL + 'assets'

# the layer_create view allows users to create layer by providing a workspace and a featureType
# this settings whitelists the datastores in which layers creation are allowed
ALLOWED_DATASTORE_LAYER_CREATE = ('*',)

# Gravatar Settings
AVATAR_GRAVATAR_SSL = True

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


# Automated Testing Settings
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

# Nose Test arguments. Will not find and run tests unless --exe is specified.
# Nose-runner has issues with coverage reporting and model loading.
# https://github.com/django-nose/django-nose/issues/180
# Coverage options are now specified in `.coveragerc`
NOSE_ARGS = [
    # '--with-coverage',
    # '--cover-package=mapstory',
    # '--cover-inclusive',
    # '--cover-erase',
    # '--cover-html',
    '--exe',
    # This:
    '--ignore-files=(^\.|^_|pavement\.py$|fabfile\.py$|local_settings\.py$|cf\.py$|search_indexes\.py$)',
    # Is not the same as this:
    # '--exclude=(^\.|^_|pavement\.py$|fabfile\.py$|_settings\.py$|cf\.py$|search_indexes\.py$)',
    '--all-modules',
    '--traverse-namespace',
    # '--detailed-errors',
    # '--with-id',
    # '--pdb',
    # '--verbosity=3',
    # '--stop',
]

# Override number of results per page listed in the GeoNode search pages
CLIENT_RESULTS_LIMIT = 30

PROJECTION_DIRECTORY = os.path.join(os.path.dirname(pyproj.__file__), 'data/')

# Activity Stream Settings
SITE_ID = 1
ACTSTREAM_SETTINGS = {
    'FETCH_RELATIONS': True,
    'USE_PREFETCH': False,
    'USE_JSONFIELD': True,
    'GFK_FETCH_DEPTH': 1,
}
