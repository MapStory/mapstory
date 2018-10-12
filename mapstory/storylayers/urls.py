from django.conf.urls import patterns, url

from .views import (download_append_csv, download_append_shp, get_remote_url,
                    layer_acls_mapstory, layer_create, layer_detail,
                    layer_remove, resolve_user_mapstory)

urlpatterns = patterns('',
                       # Layers
                       url(r'^layers/acls', layer_acls_mapstory,
                           name='layer_acls_mapstory'),
                       url(r'^layers/create$', layer_create, name='layer_create'),
                       url(r'^layers/download-append-csv$',
                           download_append_csv, name='download_append_csv'),
                       url(r'^layers/download-append-shp$',
                           download_append_shp, name='download_append_shp'),
                       url(r'^layers/resolve_user', resolve_user_mapstory,
                           name='resolve_user_mapstory'),
                       url(r'^layers/(?P<layername>[^/]*)$',
                           layer_detail, name="layer_detail"),
                       url(r'^layers/(?P<layername>[^/]*)/viewer$', layer_detail, {
                           'template': 'viewer/layer_viewer.html'}, name="layer_viewer"),
                       url(r'^layers/(?P<layername>[^/]*)/embed$', layer_detail, {
                           'template': 'viewer/layer_viewer.html'}, name="layer_embed"),
                       url(r'^layers/(?P<layername>[^/]*)/remove$',
                           layer_remove, name="layer_remove"),
                       url(r'^layers/(?P<layername>[^/]*)/remote$',
                           get_remote_url, name="get_remote_url"),

                       )
