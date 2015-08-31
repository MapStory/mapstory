from django.conf import settings
from django.conf.urls import patterns
from django.conf.urls import url
from django.conf.urls import include
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from geonode.urls import urlpatterns
from mapstory.views import layer_metadata
from maploom.geonode.urls import urlpatterns as maploom_urls
from mapstory.views import IndexView
from mapstory.views import DiaryDetailView
from mapstory.views import DiaryListView
from mapstory.views import DiaryCreateView
from mapstory.views import DiaryUpdateView
from mapstory.views import GetPageView
from mapstory.views import ProfileDetail
from mapstory.views import SearchView
from mapstory.views import LeaderListView
from mapstory.views import proxy
from mapstory.views import MapStorySignup
from mapstory.views import CommunityDetail
from mapstory.views import GroupDetail
from mapstory.views import map_detail
from mapstory.views import layer_detail
from geonode.layers.views import layer_remove, layer_replace, layer_thumbnail, layer_upload
from geonode.geoserver.views import layer_acls, resolve_user, layer_batch_download


# -- Deprecated url routes for Geoserver authentication -- remove after GeoNode 2.1
# -- Use /gs/acls, gs/resolve_user/, gs/download instead
if 'geonode.geoserver' in settings.INSTALLED_APPS:
    geonode_layers_urlpatterns = patterns('',
                           url(r'^layers/acls/?$', layer_acls, name='layer_acls_dep'),
                           url(r'^layers/resolve_user/?$', resolve_user, name='layer_resolve_user_dep'),
                           url(r'^layers/download$', layer_batch_download, name='layer_batch_download_dep'),
                           )

layer_detail_patterns = patterns('',
    url(r'^layers/(?P<layername>[^/]*)$', layer_detail, name="layer_detail"),
    )

urlpatterns = patterns('',
    url(r'^$', IndexView.as_view()),
    url(r"^account/signup/$", MapStorySignup.as_view(), name="account_signup"),
    url(r'^maps/templates/story-about-info.html$', TemplateView.as_view(template_name='mapstory/composer/story-about-info.html'), name='composer-add-layers'),
    url(r'^maps/templates/add-layers.html$', TemplateView.as_view(template_name='mapstory/composer/add-layers.html'), name='composer-add-layers'),
    url(r'^maps/templates/layer-list.html$', TemplateView.as_view(template_name='mapstory/composer/layer-list.html'), name='composer-layer-list'),
    url(r'^maps/templates/load-map-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-map-dialog.html'), name='composer-load-map'),
    url(r'^maps/templates/load-search-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-search-dialog.html'), name='composer-load-search'),
    url(r'^maps/templates/load-new-map-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-new-map-dialog.html'), name='composer-load-new-map'),

    url(r'^maps/(?P<mapid>\d+)/boxes$', include('mapstory.apps.boxes.urls')),


    url(r'^maps/new$', 'mapstory.views.new_map', name="new_map"),
    url(r'^maps/new/data$', 'mapstory.views.new_map_json', name='new_map_json'),

    url(r'^maps/new2$',
        'geonode.maps.views.new_map', {'template': 'maps/_map_view_maploom.html'},
        name='map-new2'),

    url(r'^maps/(?P<mapid>\d+)/view2$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_view.html'},
        name='map-view2'),
    url(r'^maps/(?P<mapid>\d+)/viewer$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_viewer.html'},
        name='map-viewer'),
    url(r"^storyteller/(?P<slug>[^/]*)/$", ProfileDetail.as_view(), name="profile_detail"),
    url(r'^tours/editor_tour$', TemplateView.as_view(template_name='maps/editor_tour.html'), name='editor_tour'),

    url(r'^journal$', DiaryListView.as_view(), name='diary'),
    url(r'^journal/(?P<pk>\d+)$', DiaryDetailView.as_view(), name='diary-detail'),
    url(r'^journal/write$', login_required(DiaryCreateView.as_view()), name='diary-create'),
    url(r'^journal/write/(?P<pk>\d+)$', login_required(DiaryUpdateView.as_view()), name='diary-update'),

    url(r'^initiative/(?P<slug>[^/]*)$', CommunityDetail.as_view(), name='community-detail'),

    url(r'^organization/(?P<slug>[^/]*)$', GroupDetail.as_view(), name='group_detail'),

    url(r'^get(?P<slug>\w+)$', GetPageView.as_view(), name='getpage'),
    url(r'^search/$', SearchView.as_view(), name='search'),

    url(r'^storylayerpage$', TemplateView.as_view(template_name='mapstory/storylayerpage.html'), name='storylayerpage'),
    url(r'^mapstorypage$', TemplateView.as_view(template_name='mapstory/mapstorypage.html'), name='mapstorypage'),
    url(r'^about/leadership$', LeaderListView.as_view(template_name='mapstory/leaders.html'), name='about-leaders'),
    url(r'^icons/', include('icon_commons.urls')),

    url(r'^donate$', LeaderListView.as_view(template_name='mapstory/donate.html'), name='donate'),
    url(r'^proxy/', proxy),
    url(r'^favorite/', include('geonode.contrib.favorite.urls')),
    url(r'^layers/(?P<layername>[^/]*)/upload/metadata$', layer_metadata, name="layer_upload_metadata", kwargs={'template':'upload/layer_upload_metadata.html'}),

    url(r"^flag/", include('mapstory.apps.flag.urls')),

    url(r'^maps/(?P<mapid>\d+)$', map_detail, name='map_detail'),
    url(r'^layers/upload$', layer_upload, name='layer_upload'),
    url(r'^layers/(?P<layername>[^/]*)/metadata$', layer_metadata, name="layer_metadata"),
    url(r'^layers/(?P<layername>[^/]*)/remove$', layer_remove, name="layer_remove"),
    url(r'^layers/(?P<layername>[^/]*)/replace$', layer_replace, name="layer_replace"),
    url(r'^layers/(?P<layername>[^/]*)/thumbnail$', layer_thumbnail, name='layer_thumbnail'),

) + geonode_layers_urlpatterns + layer_detail_patterns + urlpatterns

urlpatterns += maploom_urls

if settings.DEBUG:
    urlpatterns = urlpatterns + patterns('',
        url(r'^testing/(?P<template>.*)$', 'mapstory.views.test_view'),
    )


if settings.LOCAL_CONTENT:
    urlpatterns = static(settings.STATIC_URL + "assets", document_root=settings.LOCAL_ROOT + "/../../mapstory-assets", show_indexes=True) + urlpatterns

