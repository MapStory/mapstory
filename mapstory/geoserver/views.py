import logging
import traceback
from urllib import urlencode
from urlparse import parse_qsl, urlparse

import requests
from django.conf import settings
from django.http import HttpResponse
from django.utils.translation import ugettext as _
from django.views.decorators.csrf import csrf_exempt
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from geonode.geoserver.helpers import (create_gs_thumbnail,
                                       ogc_server_settings, style_update)
from geonode.geoserver.views import style_change_check

try:
    geofence_url = settings.GEOFENCE['url'].strip('/')
except AttributeError:
    geofence_url = "{}/geofence".format(
        settings.OGC_SERVER['default']['LOCATION'].strip('/'))

try:
    geofence_username = settings.GEOFENCE['username']
except AttributeError:
    geofence_username = settings.OGC_SERVER['default']['USER']

try:
    geofence_password = settings.GEOFENCE['password']
except AttributeError:
    geofence_password = settings.OGC_SERVER['default']['PASSWORD']

internal_geofence = settings.OGC_SERVER['default']['LOCATION'] in geofence_url

http_client = requests.session()
http_client.verify = True
parsed_url = urlparse(geofence_url)
retry = Retry(
    total=4,
    backoff_factor=0.9,
    status_forcelist=[502, 503, 504],
    method_whitelist=set(['HEAD', 'TRACE', 'GET', 'PUT',
                          'POST', 'OPTIONS', 'DELETE'])
)

http_client.mount("{}://".format(parsed_url.scheme),
                  HTTPAdapter(max_retries=retry))
logger = logging.getLogger("geonode.security.models")


def http_request(url, data=None, method='get', headers={}, access_token=None):
    req_method = getattr(http_client, method.lower())
    resp = None

    if access_token:
        headers['Authorization'] = "Bearer {}".format(access_token)
        parsed_url = urlparse(url)
        params = parse_qsl(parsed_url.query.strip())
        params.append(('access_token', access_token))
        params = urlencode(params)
        url = "{proto}://{address}{path}?{params}".format(proto=parsed_url.scheme, address=parsed_url.netloc,
                                                          path=parsed_url.path, params=params)

        try:
            resp = req_method(url, headers=headers, data=data)
        except:
            logger.debug(traceback.format_exc())
    else:
        try:
            resp = req_method(url, headers=headers, data=data, auth=(
                geofence_username, geofence_password))
        except:
            logger.debug(traceback.format_exc())

    return resp


@csrf_exempt
def geoserver_rest_proxy(request, proxy_path, downstream_path):

    print("HELLO WE HIT GEOSERVER REST PROXY")

    if not request.user.is_authenticated():
        return HttpResponse(
            "You must be logged in to access GeoServer",
            content_type="text/plain",
            status=401)

    def strip_prefix(path, prefix):
        assert path.startswith(prefix)
        return path[len(prefix):]

    path = strip_prefix(request.get_full_path(), proxy_path)
    url = str("".join([ogc_server_settings.LOCATION, downstream_path, path]))

    headers = dict()

    affected_layers = None

    if request.method in ("POST", "GET", "PUT") and "CONTENT_TYPE" in request.META:
        headers["Content-Type"] = request.META["CONTENT_TYPE"]
        # if user is not authorized, we must stop him
        # we need to sync django here and check if some object (styles) can
        # be edited by the user
        # we should remove this geonode dependency calling layers.views straight
        # from GXP, bypassing the proxy
        if downstream_path in ('rest/styles', 'rest/layers') and len(request.body) > 0:
            if not style_change_check(request, downstream_path):
                return HttpResponse(
                    _("You don't have permissions to change style for this layer"),
                    content_type="text/plain",
                    status=401)
            if downstream_path == 'rest/styles':
                affected_layers = style_update(request, url)

    response = http_request(url,
                            method=request.method,
                            headers=headers,
                            data=request.body or None)

    # update thumbnails
    if affected_layers:
        for layer in affected_layers:
            logger.debug(
                'Updating thumbnail for layer with uuid %s' % layer.uuid)
            create_gs_thumbnail(layer, True)

    return HttpResponse(
        content=response.content,
        status=response.status_code,
        content_type=response.headers.get("content-type", "text/plain"))
