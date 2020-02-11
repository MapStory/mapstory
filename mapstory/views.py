import datetime
import json
import urlparse
import math
import re

from urllib import quote
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.core.urlresolvers import reverse, resolve

from geonode.base.models import Region
from mapstory.journal.models import JournalEntry
from mapstory.models import Baselayer, BaselayerDefault, GetPage, Leader, NewsItem, get_images, get_sponsors
from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings
from geonode.utils import (
    DEFAULT_ABSTRACT,
    DEFAULT_TITLE,
    default_map_config,
    bbox_to_projection,
    check_ogc_backend,
    forward_mercator
)
from geonode.maps.views import _resolve_map
from geonode.maps.models import Map, MapLayer
from django.core.exceptions import ObjectDoesNotExist
from geonode.layers.views import _resolve_layer
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.csrf import requires_csrf_token
from distutils.version import StrictVersion
from django.http.request import validate_host
from django.utils.http import is_safe_url
from django.middleware.csrf import get_token
from httplib import HTTPConnection, HTTPSConnection
from geonode import geoserver, qgis_server
if check_ogc_backend(geoserver.BACKEND_PACKAGE):
    # FIXME: The post service providing the map_status object
    # should be moved to geonode.geoserver.
    from geonode.geoserver.helpers import ogc_server_settings
elif check_ogc_backend(qgis_server.BACKEND_PACKAGE):
    from geonode.qgis_server.helpers import ogc_server_settings
try:
    if 'ssl_pki' not in settings.INSTALLED_APPS:
        raise ImportError
    from ssl_pki.models import uses_proxy_route
    from ssl_pki.models import has_ssl_config
    from ssl_pki.views import pki_request
    from ssl_pki.utils import (
        protocol_relative_url,
        protocol_relative_to_scheme,
    )
except ImportError:
    uses_proxy_route = None
    has_ssl_config = None
    pki_request = None
    protocol_relative_url = None
    protocol_relative_to_scheme = None


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        news_items = NewsItem.objects.filter(date__lte=datetime.datetime.now())
        ctx['news_items'] = news_items[:3]
        ctx['images'] = get_images()
        # for now, limit to max of 8.
        ctx['journal_entries'] = JournalEntry.objects.filter(
            publish=True, show_on_main=True)[:8]

        return ctx


class GetPageView(DetailView):
    template_name = 'mapstory/getpage.html'
    model = GetPage
    slug_field = 'name'


class SearchView(TemplateView):
    template_name = 'search/explore.html'

    def get_context_data(self, **kwargs):
        context = super(TemplateView, self).get_context_data(**kwargs)
        context['regions'] = Region.objects.filter(level=1)
        return context


class LeaderListView(ListView):
    context_object_name = 'leaders'
    model = Leader


def baselayer_view(request):
    return HttpResponse(json.dumps({"defaultLayer": BaselayerDefault.objects.first().layer.name,
                                    "layers":  map(lambda x: x.to_object(), Baselayer.objects.all())}))


@requires_csrf_token
def proxy(request, url=None, response_callback=None,
          sec_chk_hosts=True, sec_chk_rules=True, **kwargs):
    # Security rules and settings
    PROXY_ALLOWED_HOSTS = getattr(settings, 'PROXY_ALLOWED_HOSTS', ())

    # Sanity url checks
    if 'url' not in request.GET and not url:
        return HttpResponse("The proxy service requires a URL-encoded URL as a parameter.",
                            status=400,
                            content_type="text/plain"
                            )

    raw_url = url or request.GET['url']
    raw_url = urlparse.urljoin(
        settings.SITEURL,
        raw_url) if raw_url.startswith("/") else raw_url
    url = urlparse.urlsplit(raw_url)
    locator = str(url.path)
    if url.query != "":
        locator += '?' + url.query
    if url.fragment != "":
        locator += '#' + url.fragment

    # Fix up any possible non-absolute URLs that have no scheme, or even domain
    if ((callable(protocol_relative_url) and
         protocol_relative_url(raw_url)) or not url.scheme):
        if url.netloc and callable(protocol_relative_to_scheme):
            # Fix up any '//' protocol relative URLs coming from JS map viewers
            # Use request.scheme to reference origin scheme context
            # Note: Can't use request.build_absolute_uri(raw_url) for this
            raw_url = protocol_relative_to_scheme(url.geturl(),
                                                  scheme=request.scheme)
        else:
            raw_url = request.build_absolute_uri(raw_url)
        url = urlparse.urlsplit(raw_url)

    access_token = None
    if request and 'access_token' in request.session:
        access_token = request.session['access_token']

    # White-Black Listing Hosts
    if sec_chk_hosts and not settings.DEBUG:
        site_url = urlparse.urlsplit(settings.SITEURL)
        if site_url.hostname not in PROXY_ALLOWED_HOSTS:
            PROXY_ALLOWED_HOSTS += (site_url.hostname, )

        if check_ogc_backend(geoserver.BACKEND_PACKAGE):
            from geonode.geoserver.helpers import ogc_server_settings
            hostname = (
                ogc_server_settings.hostname,
            ) if ogc_server_settings else ()
            if hostname not in PROXY_ALLOWED_HOSTS:
                PROXY_ALLOWED_HOSTS += hostname

        ows_regexp = re.compile(
            "^(?i)(version)=(\d\.\d\.\d)(?i)&(?i)request=(?i)(GetCapabilities)&(?i)service=(?i)(\w\w\w)$")
        if url.query and ows_regexp.match(url.query):
            ows_tokens = ows_regexp.match(url.query).groups()
            if len(ows_tokens) == 4 and 'version' == ows_tokens[0] and StrictVersion(
                    ows_tokens[1]) >= StrictVersion("1.0.0") and StrictVersion(
                        ows_tokens[1]) <= StrictVersion("3.0.0") and ows_tokens[2].lower() in (
                            'getcapabilities') and ows_tokens[3].upper() in ('OWS', 'WCS', 'WFS', 'WMS', 'WPS', 'CSW'):
                if url.hostname not in PROXY_ALLOWED_HOSTS:
                    PROXY_ALLOWED_HOSTS += (url.hostname, )

        if not (validate_host(url.hostname, PROXY_ALLOWED_HOSTS) or
                (callable(has_ssl_config) and has_ssl_config(url.geturl()))):
            return HttpResponse("DEBUG is set to False but the host of the "
                                "path provided to the proxy service is not in "
                                "the PROXY_ALLOWED_HOSTS setting or defined "
                                "to use the proxy in SSL/PKI configurations.",
                                status=403,
                                content_type="text/plain"
                                )

    # Security checks based on rules; allow only specific requests
    if sec_chk_rules:
        # TODO: Not yet implemented
        pass

    # Collecting headers and cookies
    headers = {}
    cookies = None
    csrftoken = None

    if url.scheme.lower() == 'https' \
            and callable(has_ssl_config) and has_ssl_config(url.geturl()):
        # Adjust request to mock call to pki_request view
        # Merge queries
        pki_req_query = request.GET.copy()
        """django.http.QueryDict"""
        # Strip the url param from request query
        del pki_req_query['url']
        # Note: leave other query pairs passed to this view, e.g. access_token

        # Add any query from passed url param's URL
        url_query = url.query.strip()
        for k, v in urlparse.parse_qsl(url_query, keep_blank_values=True):
            pki_req_query.appendlist(k, v)
        request.GET = pki_req_query
        request.META["QUERY_STRING"] = pki_req_query.urlencode()

        # pki_request view is restricted to local calls
        request.META["REMOTE_ADDR"] = '127.0.0.1'
        request.META["REMOTE_HOST"] = 'localhost'
        # TODO: Update HTTP_X_FORWARDED_FOR? See: api.views.get_client_ip()

        base_url = urlparse.urlunsplit((None, url.netloc, url.path, None, None))\
            .replace('//', '', 1)
        # For pki_request view, resource_url has no URL scheme
        resource_url = quote(base_url)

        pki_path = reverse('pki_request',
                           kwargs={'resource_url': resource_url})
        # Reset view paths attributes
        request.path = request.path_info = pki_path
        request.META["PATH_INFO"] = pki_path
        request.resolver_match = resolve(pki_path)
        return pki_request(request, resource_url=resource_url)

    if settings.SESSION_COOKIE_NAME in request.COOKIES and is_safe_url(
            url=raw_url, host=url.hostname):
        cookies = request.META["HTTP_COOKIE"]

    for cook in request.COOKIES:
        name = str(cook)
        value = request.COOKIES.get(name)
        if name == 'csrftoken':
            csrftoken = value
        cook = "%s=%s" % (name, value)
        cookies = cook if not cookies else (cookies + '; ' + cook)

    csrftoken = get_token(request) if not csrftoken else csrftoken

    if csrftoken:
        headers['X-Requested-With'] = "XMLHttpRequest"
        headers['X-CSRFToken'] = csrftoken
        cook = "%s=%s" % ('csrftoken', csrftoken)
        cookies = cook if not cookies else (cookies + '; ' + cook)

    if cookies:
        if 'JSESSIONID' in request.session and request.session['JSESSIONID']:
            cookies = cookies + '; JSESSIONID=' + \
                request.session['JSESSIONID']
        headers['Cookie'] = cookies

    if request.method in ("POST", "PUT") and "CONTENT_TYPE" in request.META:
        headers["Content-Type"] = request.META["CONTENT_TYPE"]

    access_token = None
    if request and 'access_token' in request.session:
        access_token = request.session['access_token']

    if access_token:
        # TODO: Bearer is currently cutted of by Djano / GeoServer
        if request.method in ("POST", "PUT"):
            headers['Authorization'] = 'Bearer %s' % access_token
        if access_token and 'access_token' not in locator:
            query_separator = '&' if '?' in locator else '?'
            locator = ('%s%saccess_token=%s' %
                       (locator, query_separator, access_token))
    elif 'HTTP_AUTHORIZATION' in request.META:
        auth = request.META.get(
            'HTTP_AUTHORIZATION',
            request.META.get('HTTP_AUTHORIZATION2'))
        if auth:
            headers['Authorization'] = auth

    site_url = urlparse.urlsplit(settings.SITEURL)

    pragma = "no-cache"
    referer = request.META[
        "HTTP_REFERER"] if "HTTP_REFERER" in request.META else \
        "{scheme}://{netloc}/".format(scheme=site_url.scheme,
                                      netloc=site_url.netloc)
    encoding = request.META["HTTP_ACCEPT_ENCODING"] if "HTTP_ACCEPT_ENCODING" in request.META else "gzip"

    headers.update({"Pragma": pragma,
                    "Referer": referer,
                    "Accept-encoding": encoding, })

    if url.scheme == 'https':
        conn = HTTPSConnection(url.hostname, url.port)
    else:
        conn = HTTPConnection(url.hostname, url.port)
    conn.request(request.method, locator.encode('utf8'), request.body, headers)
    response = conn.getresponse()
    content = response.read()
    status = response.status
    content_type = response.getheader("Content-Type", "text/plain")

    # decompress GZipped responses if not enabled
    if content and response.getheader('Content-Encoding') == 'gzip':
        from StringIO import StringIO
        import gzip
        buf = StringIO(content)
        f = gzip.GzipFile(fileobj=buf)
        content = f.read()

    if response_callback:
        kwargs = {} if not kwargs else kwargs
        kwargs.update({
            'response': response,
            'content': content,
            'status': status,
            'content_type': content_type
        })
        return response_callback(**kwargs)
    else:
        # If we get a redirect, let's add a useful message.
        if status in (301, 302, 303, 307):
            _response = HttpResponse(('This proxy does not support redirects. The server in "%s" '
                                      'asked for a redirect to "%s"' % (url, response.getheader('Location'))),
                                     status=status,
                                     content_type=content_type
                                     )
            _response['Location'] = response.getheader('Location')
            return _response
        else:
            return HttpResponse(
                content=content,
                status=status,
                content_type=content_type)


def add_layers_to_map_config(
        request, map_obj, layer_names, add_base_layers=True):
    DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config(request)

    bbox = []
    layers = []
    for layer_name in layer_names:
        try:
            layer = _resolve_layer(request, layer_name)
        except ObjectDoesNotExist:
            # bad layer, skip
            continue

        if not request.user.has_perm(
                'view_resourcebase',
                obj=layer.get_self_resource()):
            # invisible layer, skip inclusion
            continue

        layer_bbox = layer.bbox[0:4]
        bbox = layer_bbox[:]
        bbox[0] = layer_bbox[0]
        bbox[1] = layer_bbox[2]
        bbox[2] = layer_bbox[1]
        bbox[3] = layer_bbox[3]
        # assert False, str(layer_bbox)

        def decimal_encode(bbox):
            import decimal
            _bbox = []
            for o in [float(coord) for coord in bbox]:
                if isinstance(o, decimal.Decimal):
                    o = (str(o) for o in [o])
                _bbox.append(o)
            # Must be in the form : [x0, x1, y0, y1
            return [_bbox[0], _bbox[2], _bbox[1], _bbox[3]]

        def sld_definition(style):
            from urllib import quote
            _sld = {
                "title": style.sld_title or style.name,
                "legend": {
                    "height": "40",
                    "width": "22",
                    "href": layer.ows_url +
                    "?service=wms&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" +
                    quote(layer.service_typename, safe=''),
                    "format": "image/png"
                },
                "name": style.name
            }
            return _sld

        config = layer.attribute_config()
        if hasattr(layer, 'srid'):
            config['crs'] = {
                'type': 'name',
                'properties': layer.srid
            }
        # Add required parameters for GXP lazy-loading
        attribution = "%s %s" % (layer.owner.first_name,
                                 layer.owner.last_name) if layer.owner.first_name or layer.owner.last_name else str(
            layer.owner)
        srs = getattr(settings, 'DEFAULT_MAP_CRS', 'EPSG:3857')
        srs_srid = int(srs.split(":")[1]) if srs != "EPSG:900913" else 3857
        config["attribution"] = "<span class='gx-attribution-title'>%s</span>" % attribution
        config["format"] = getattr(
            settings, 'DEFAULT_LAYER_FORMAT', 'image/png')
        config["title"] = layer.title
        config["wrapDateLine"] = True
        config["visibility"] = True
        config["srs"] = srs
        config["bbox"] = decimal_encode(
            bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                               target_srid=int(srs.split(":")[1]))[:4])
        config["capability"] = {
            "abstract": layer.abstract,
            "name": layer.alternate,
            "title": layer.title,
            "queryable": True,
            "storeType": layer.storeType,
            "bbox": {
                layer.srid: {
                    "srs": layer.srid,
                    "bbox": decimal_encode(bbox)
                },
                srs: {
                    "srs": srs,
                    "bbox": decimal_encode(
                        bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                                           target_srid=srs_srid)[:4])
                },
                "EPSG:4326": {
                    "srs": "EPSG:4326",
                    "bbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
                    decimal_encode(bbox_to_projection(
                        [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
                },
                "EPSG:900913": {
                    "srs": "EPSG:900913",
                    "bbox": decimal_encode(bbox) if layer.srid == 'EPSG:900913' else
                    decimal_encode(bbox_to_projection(
                        [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=3857)[:4])
                }
            },
            "srs": {
                srs: True
            },
            "formats": ["image/png", "application/atom xml", "application/atom+xml", "application/json;type=utfgrid",
                        "application/openlayers", "application/pdf", "application/rss xml", "application/rss+xml",
                        "application/vnd.google-earth.kml", "application/vnd.google-earth.kml xml",
                        "application/vnd.google-earth.kml+xml", "application/vnd.google-earth.kml+xml;mode=networklink",
                        "application/vnd.google-earth.kmz", "application/vnd.google-earth.kmz xml",
                        "application/vnd.google-earth.kmz+xml", "application/vnd.google-earth.kmz;mode=networklink",
                        "atom", "image/geotiff", "image/geotiff8", "image/gif", "image/gif;subtype=animated",
                        "image/jpeg", "image/png8", "image/png; mode=8bit", "image/svg", "image/svg xml",
                        "image/svg+xml", "image/tiff", "image/tiff8", "image/vnd.jpeg-png",
                        "kml", "kmz", "openlayers", "rss", "text/html; subtype=openlayers", "utfgrid"],
            "attribution": {
                "title": attribution
            },
            "infoFormats": ["text/plain", "application/vnd.ogc.gml", "text/xml", "application/vnd.ogc.gml/3.1.1",
                            "text/xml; subtype=gml/3.1.1", "text/html", "application/json"],
            "styles": [sld_definition(s) for s in layer.styles.all()],
            "prefix": layer.alternate.split(":")[0] if ":" in layer.alternate else "",
            "keywords": [k.name for k in layer.keywords.all()] if layer.keywords else [],
            "llbbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
            decimal_encode(bbox_to_projection(
                [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
        }

        all_times = None
        if check_ogc_backend(geoserver.BACKEND_PACKAGE):
            from geonode.geoserver.views import get_capabilities
            workspace, layername = layer.alternate.split(
                ":") if ":" in layer.alternate else (None, layer.alternate)
            # WARNING Please make sure to have enabled DJANGO CACHE as per
            # https://docs.djangoproject.com/en/2.0/topics/cache/#filesystem-caching
            wms_capabilities_resp = get_capabilities(
                request, layer.id, tolerant=True)
            if wms_capabilities_resp.status_code >= 200 and wms_capabilities_resp.status_code < 400:
                wms_capabilities = wms_capabilities_resp.getvalue()
                if wms_capabilities:
                    import xml.etree.ElementTree as ET
                    namespaces = {'wms': 'http://www.opengis.net/wms',
                                  'xlink': 'http://www.w3.org/1999/xlink',
                                  'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}

                    e = ET.fromstring(wms_capabilities)
                    for atype in e.findall(
                            "./[wms:Name='%s']/wms:Dimension[@name='time']" % (layer.alternate), namespaces):
                        dim_name = atype.get('name')
                        if dim_name:
                            dim_name = str(dim_name).lower()
                            if dim_name == 'time':
                                dim_values = atype.text
                                if dim_values:
                                    all_times = dim_values.split(",")
                                    break
            if all_times:
                config["capability"]["dimensions"] = {
                    "time": {
                        "name": "time",
                        "units": "ISO8601",
                        "unitsymbol": None,
                        "nearestVal": False,
                        "multipleVal": False,
                        "current": False,
                        "default": "current",
                        "values": all_times
                    }
                }

        if layer.storeType == "remoteStore":
            service = layer.remote_service
            source_params = {}
            if service.type in ('REST_MAP', 'REST_IMG'):
                source_params = {
                    "ptype": service.ptype,
                    "remote": True,
                    "url": service.service_url,
                    "name": service.name,
                    "title": "[R] %s" % service.title}
            source_params["use_proxy"] = (callable(uses_proxy_route) and
                                 uses_proxy_route(service.base_url))
            maplayer = MapLayer(map=map_obj,
                                name=layer.alternate,
                                ows_url=layer.ows_url,
                                layer_params=json.dumps(config),
                                visibility=True,
                                source_params=json.dumps(source_params)
            )
        else:
            ogc_server_url = urlparse.urlsplit(
                ogc_server_settings.PUBLIC_LOCATION).netloc
            layer_url = urlparse.urlsplit(layer.ows_url).netloc

            access_token = request.session['access_token'] if request and 'access_token' in request.session else None
            if access_token and ogc_server_url == layer_url and 'access_token' not in layer.ows_url:
                url = layer.ows_url + '?access_token=' + access_token
            else:
                url = layer.ows_url
            maplayer = MapLayer(
                map=map_obj,
                name=layer.alternate,
                ows_url=url,
                # use DjangoJSONEncoder to handle Decimal values
                layer_params=json.dumps(config, cls=DjangoJSONEncoder),
                visibility=True
            )

        layers.append(maplayer)

    if bbox and len(bbox) >= 4:
        minx, maxx, miny, maxy = [float(coord) for coord in bbox]
        x = (minx + maxx) / 2
        y = (miny + maxy) / 2

        if getattr(
            settings,
            'DEFAULT_MAP_CRS',
                'EPSG:3857') == "EPSG:4326":
            center = list((x, y))
        else:
            center = list(forward_mercator((x, y)))

        if center[1] == float('-inf'):
            center[1] = 0

        BBOX_DIFFERENCE_THRESHOLD = 1e-5

        # Check if the bbox is invalid
        valid_x = (maxx - minx) ** 2 > BBOX_DIFFERENCE_THRESHOLD
        valid_y = (maxy - miny) ** 2 > BBOX_DIFFERENCE_THRESHOLD

        if valid_x:
            width_zoom = math.log(360 / abs(maxx - minx), 2)
        else:
            width_zoom = 15

        if valid_y:
            height_zoom = math.log(360 / abs(maxy - miny), 2)
        else:
            height_zoom = 15

        map_obj.center_x = center[0]
        map_obj.center_y = center[1]
        map_obj.zoom = math.ceil(min(width_zoom, height_zoom))

    map_obj.handle_moderated_uploads()

    if add_base_layers:
        layers_to_add = DEFAULT_BASE_LAYERS + layers
    else:
        layers_to_add = layers
    config = map_obj.viewer_json(
        request, *layers_to_add)

    config['fromLayer'] = True
    return config


def new_map_config(request):
    '''
    View that creates a new map.
    If the query argument 'copy' is given, the initial map is
    a copy of the map with the id specified, otherwise the
    default map configuration is used.  If copy is specified
    and the map specified does not exist a 404 is returned.
    '''
    DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config(request)

    map_obj = None
    if request.method == 'GET' and 'copy' in request.GET:
        mapid = request.GET['copy']
        map_obj = _resolve_map(request, mapid, 'base.view_resourcebase')

        map_obj.abstract = DEFAULT_ABSTRACT
        map_obj.title = DEFAULT_TITLE
        if request.user.is_authenticated():
            map_obj.owner = request.user

        config = map_obj.viewer_json(request)
        map_obj.handle_moderated_uploads()
        del config['id']
    else:
        if request.method == 'GET':
            params = request.GET
        elif request.method == 'POST':
            params = request.POST
        else:
            return HttpResponse(status=405)

        if 'layer' in params:
            map_obj = Map(projection=getattr(settings, 'DEFAULT_MAP_CRS',
                                             'EPSG:3857'))
            config = add_layers_to_map_config(
                request, map_obj, params.getlist('layer'))
        else:
            config = DEFAULT_MAP_CONFIG
    return map_obj, json.dumps(config)


def maploom_new_map(request, template='maps/map_new.html'):
    map_obj, config = new_map_config(request)

    config_obj = json.loads(config)

    sources_array = []
    layers = []

    for layer in Baselayer.objects.all():
        layer_obj = layer.to_object()
        try:
            source_index = sources_array.index(layer_obj["source"])
        except ValueError:
            sources_array.append(layer_obj["source"])
            source_index = len(sources_array) - 1

        layer_obj["source"] = str(source_index)
        layers.append(layer_obj)

    sources_array.append({
        "title": "GeoServer - Public Layers",
        "attribution": "&copy; %s",
        "ptype": "gxp_wmscsource",
        "url": settings.SITEURL + "/geoserver/wms",
        "restUrl": "/gs/rest"
    })
    viewed_layer = config_obj["map"]["layers"][-1]
    viewed_layer["source"] = str(len(sources_array) - 1)

    layers.append(viewed_layer)

    sources = {}
    for idx, source in enumerate(sources_array):
        sources[str(idx)] = source

    # print(sources)

    config_obj["map"]["layers"] = layers
    config_obj["sources"] = sources

    context_dict = {
        "config": json.dumps(config_obj),
        "map": map_obj
    }

    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    if isinstance(config, HttpResponse):
        return config
    else:
        return render(
            request,
            template,
            context=context_dict)


