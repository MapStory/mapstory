# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2019 Planet Federal
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

"""Remote service handling base classes and helpers."""

import logging

from django.utils.datastructures import OrderedDict
from django.conf import settings

from geonode.services import enumerations
from mapstory.remoteservices.serviceprocessors.arcgis import \
    MapstoryArcMapServiceHandler, MapstoryArcImageServiceHandler
from mapstory.remoteservices.serviceprocessors.wms import \
    MapstoryWmsServiceHandler, MapstoryServiceHandler
from mapstory.utils import get_bearer_token

try:
    if 'ssl_pki' not in settings.INSTALLED_APPS:
        raise ImportError
    from ssl_pki.models import has_ssl_config
    from ssl_pki.utils import pki_route
except ImportError:
    has_ssl_config = None
    pki_route = None

logger = logging.getLogger(__name__)


def get_service_handler(base_url, proxy_base=None,
                        service_type=enumerations.AUTO, headers=None):
    """Return the appropriate remote service handler for the input URL.
    If the service type is not explicitly passed in it will be guessed from
    """

    handlers = OrderedDict({
        enumerations.WMS: {"OWS": True, "handler": MapstoryWmsServiceHandler},
        enumerations.GN_WMS: {"OWS": True, "handler": MapstoryServiceHandler},
        enumerations.REST_MAP: {"OWS": False, "handler": MapstoryArcMapServiceHandler},
        enumerations.REST_IMG: {"OWS": False, "handler": MapstoryArcImageServiceHandler},
    })
    if service_type in (enumerations.AUTO, enumerations.OWS):
        if service_type == enumerations.AUTO:
            to_check = handlers.keys()
        else:
            to_check = [k for k, v in handlers.items() if v["OWS"]]
        for type_ in to_check:
            logger.debug("Checking {}...".format(type_))
            try:
                service = get_service_handler(base_url, type_,
                                              headers=(headers or None))
            except Exception:
                pass  # move on to the next service type
            else:
                break
        else:
            raise RuntimeError("Could not parse service {!r} with any of the "
                               "available service handlers".format(base_url))
    else:
        handler = handlers.get(service_type, {}).get("handler")

        if (base_url.lower().startswith('https') and
                (callable(has_ssl_config) and
                 has_ssl_config(base_url, via_query=True))):
            # has_ssl_config needs to query db, as call may be from task
            # worker, whose hostnameport_pattern_cache may be out of sync
            base_url = pki_route(base_url)
            logger.debug('Rewritten URL for pki proxy: {0}'.format(base_url))

            bearer_header = {'Authorization': "Bearer {0}".format(
                get_bearer_token(valid_time=30))}
            logger.debug('Add bearer_header: {0}'.format(repr(bearer_header)))
            if headers and isinstance(headers, dict):
                headers.update(bearer_header)
            else:
                headers = bearer_header

            # Pass service type to pki_request view, for workarounds
            headers['PKI_SERVICE_TYPE'] = "{0}".format(service_type)

        try:
            service = handler(base_url, headers=headers)
        except Exception:
            logger.exception(
                msg="Could not parse service {!r}".format(base_url))
            raise
    return service
