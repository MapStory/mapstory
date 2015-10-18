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
import os
from geonode.settings import *
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

# Note that Django automatically includes the "templates" dir in all the
# INSTALLED_APPS, se there is no need to add maps/templates or admin/templates
TEMPLATE_DIRS = (
    os.path.join(LOCAL_ROOT, "templates"),
) + TEMPLATE_DIRS

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

INSTALLED_APPS += (
    'mapstory',
    'django.contrib.webdesign',
    'geonode.contrib.geogig',
    'icon_commons',
    'maploom',
    'geonode.contrib.favorite',
    'haystack',
    'mailer',
    'django_slack',
)

TEMPLATE_CONTEXT_PROCESSORS += (
    'mapstory.context_processors.context',
    'user_messages.context_processors.user_messages'
)

OGC_SERVER = {
    'default' : {
        'BACKEND' : 'geonode.geoserver',
        'LOCATION' : 'http://localhost:8080/geoserver/',
        # PUBLIC_LOCATION needs to be kept like this because in dev mode
        # the proxy won't work and the integration tests will fail
        # the entire block has to be overridden in the local_settings
        'PUBLIC_LOCATION' : 'http://localhost:8000/geoserver/',
        'USER' : 'admin',
        'PASSWORD' : 'geoserver',
        'MAPFISH_PRINT_ENABLED' : True,
        'PRINT_NG_ENABLED' : True,
        'GEONODE_SECURITY_ENABLED' : True,
        'GEOGIG_ENABLED' : True,
        'WMST_ENABLED' : False,
        'BACKEND_WRITE_ENABLED': True,
        'WPS_ENABLED' : True,
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': '', #'datastore',
        'TIMEOUT': 10,  # number of seconds to allow for HTTP requests,
        'GEOGIG_DATASTORE_DIR': '/var/lib/geoserver/data/geogig'
    }
}

DEBUG_STATIC = True

REMOTE_CONTENT_URL = 'http://mapstory.dev.boundlessgeo.com/mapstory-assets'
REGISTRATION_OPEN = True

DATABASE_PASSWORD = None

AUTOCOMPLETE_QUICK_SEARCH = False

ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
ACCOUNT_EMAIL_CONFIRMATION_EMAIL = True
# Where to load mapstory-assets from. If True, use /static/assets
# otherwise use REMOTE_CONTENT_URL
# To use local, ensure that the mapstory-assets repository is checked out in
# this project's parent (i.e. ../mapstory-assets)
LOCAL_CONTENT = False

if os.path.exists('mapstory/settings/local_settings.py'):
    exec open('mapstory/settings/local_settings.py') in globals()

#@todo remove this hack once maploom can deal with other config
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
        "type":"OpenLayers.Layer",
        "args":["No background"],
        "visibility": False,
        "fixed": True,
        "group":"background"
    },
    {
        "source": {"ptype":"gxp_olsource"},
        "type":"OpenLayers.Layer.OSM",
        "args":["OpenStreetMap"],
        'title': 'This is the title',
        "visibility": False,
        "fixed": True,
        "group":"background"
    },
    {
        "source": {"ptype":"gxp_olsource"},
        "type":"OpenLayers.Layer.OSM",
        "args":["Humanitarian OpenStreetMap", [
            "http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png",
            "http://b.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png",
            "http://c.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png"
          ], {"tileOptions": {"crossOriginKeyword": None}}
        ],
        'title': 'This is the title',
        "visibility": False,
        "fixed": True,
        "group":"background"
    },
    {
        "source": {"ptype":"gxp_olsource"},
        "type":"OpenLayers.Layer.WMS",
        "group":"background",
        "visibility": False,
        "fixed": True,
        "args":[
            "Naked Earth",
            "http://maps.opengeo.org/geowebcache/service/wms",
            {
                "layers":["Wayne"],
                "format":"image/png",
                "tiled": True,
                "tilesOrigin":[-20037508.34, -20037508.34]
            },
            {"buffer":0}
        ]
    },
    {
        'source': {
            'ptype': 'gxp_mapquestsource',
            'hidden': True
        },
        'visibility': False,
        'name': 'naip',
        'title': 'Satellite Imagery',
        'group': 'background',
        'args': ['Satellite Imagery']
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
        'name': 'world-light',
        'title': 'World Light',
        'group': 'background'
    }
]

if LOCAL_CONTENT:
    REMOTE_CONTENT_URL = STATIC_URL + 'assets'

if DATABASE_PASSWORD:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'mapstory',
            'USER': 'mapstory',
            'PASSWORD': DATABASE_PASSWORD,
            'HOST' : 'localhost',
            'PORT' : '5432',
        },
        'datastore' : {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': 'mapstory_data',
            'USER' : 'mapstory',
            'PASSWORD' : DATABASE_PASSWORD,
            'HOST' : 'localhost',
            'PORT' : '5432',
        }
    }

    OGC_SERVER['default']['DATASTORE'] = 'datastore'

    UPLOADER = {
        'BACKEND': 'geonode.importer',
        'OPTIONS': {
            'TIME_ENABLED': True,
            'GEOGIG_ENABLED': True,
        }
    }

    USE_BIG_DATE = True

    GEOGIG_DATASTORE_NAME = 'geogig'

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
        },
    }

