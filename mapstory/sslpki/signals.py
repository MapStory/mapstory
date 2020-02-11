import json
import logging

from django.dispatch import receiver

from geonode.base.models import Link
from geonode.maps.models import MapLayer

from ssl_pki.models import (
    hostnameport_pattern_for_url,
    HostnamePortSslConfig,
)
from ssl_pki.utils import (
    has_proxy_prefix,
    proxy_route,
    proxy_route_reverse
)
from ssl_pki.signals import patterns_changed

logger = logging.getLogger(__name__)


def sync_layer_legend_urls():
    """
        Sync saved layer's legend URL that indicates it be requested through
        /pki route (via GeoNode's /proxy route) when changes occur to the
        HostnamePortSslConfig mappings, including reordering.
        Note: The update can happen if the map layer's URL now maps to an
        SslConfig, even if it may not have mapped upon initial saving.
        Important: Proxying is triggered if a mapping is enabled and matched,
        as the JS map viewers manage/generate the legend link themselves from
        the layer's base URL. This legend link is currently only shown on
        the layer/map details page.
        """
    links = list(Link.objects.filter(name='Legend').order_by('url'))
    """:type: list[geonode.base.models.Link]"""

    for link in links:
        if not link.url.lower().startswith('https') \
                and not has_proxy_prefix(link.url):
            continue

        orig_url = proxy_route_reverse(link.url)
        ptn = hostnameport_pattern_for_url(orig_url, uses_proxy=True)
        if ptn is not None:
            logger.debug(u'Original link URL matched hostname:port proxy '
                         u'pattern: {0} > {1}'.format(orig_url, ptn))
            # Legend graphic URLs should be proxied through geonode
            new_url = proxy_route(orig_url)
        else:
            logger.debug(u'Original link URL does not match any hostname:port '
                         u'proxy pattern: {0}'.format(orig_url))
            new_url = orig_url

        if new_url != link.url:
            link.url = new_url
            logger.debug(u'Updating link URL: {0}'.format(new_url))
            link.save(update_fields=['url'])


def sync_map_layers():
    """
    Sync/add saved map layer's flag that indicates it be requested through
    /pki route (via GeoNode's /proxy route) when changes occur to the
    HostnamePortSslConfig mappings, including reordering.
    Note: The flag can be added if the map layer's URL now maps to an
    SslConfig, even if it may not have mapped upon initial saving.
    """
    map_lyrs = list(MapLayer.objects.exclude(ows_url__isnull=True))
    """:type: list[geonode.maps.models.MapLayer]"""

    for map_lyr in map_lyrs:
        ptn = hostnameport_pattern_for_url(map_lyr.ows_url, uses_proxy=True)
        if ptn is not None:
            logger.debug(u'MapLayer URL matched hostname:port proxy pattern:'
                         u'{0} > {1}'.format(map_lyr, ptn))
        else:
            logger.debug(u'MapLayer URL does not match any proxied '
                         u'hostname:port: {0}'.format(map_lyr))
        src_params = json.loads(map_lyr.source_params)
        src_params['use_proxy'] = (ptn is not None)
        map_lyr.source_params = json.dumps(src_params)
        map_lyr.save(update_fields=['source_params'])


# noinspection PyUnusedLocal
@receiver(patterns_changed, sender=HostnamePortSslConfig,
          dispatch_uid='ssl_pki_signals_patterns_changed')
def add_update_patterns(sender, **kwargs):
    """
    Respond to HostnamePortSslConfig changes (adds/updates/deletions)
    """
    sync_layer_legend_urls()
    sync_map_layers()
