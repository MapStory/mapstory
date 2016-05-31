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
from mapstory.views import profile_delete, profile_edit
from mapstory.views import SearchView
from mapstory.views import LeaderListView
from mapstory.views import proxy
from mapstory.views import MapStorySignup
from mapstory.views import map_detail
from mapstory.views import layer_detail, layer_detail_id
from mapstory.views import layer_create, layer_append
from mapstory.views import layer_remove, map_remove
from mapstory.views import MapStoryConfirmEmailView
from mapstory.notifications import notify_download, set_profile_notification
from geonode.layers.views import layer_replace, layer_thumbnail, layer_upload
from geonode.geoserver.views import layer_acls, resolve_user, layer_batch_download
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView
from osgeo_importer.urls import urlpatterns as importer_urlpatterns
from mapstory.views import organization_create, organization_edit, organization_detail, organization_members
from mapstory.views import organization_invite, organization_members_add, organization_member_remove
from mapstory.views import initiative_create, initiative_edit, initiative_detail, initiative_members
from mapstory.views import initiative_invite, initiative_members_add, initiative_member_remove

# -- Deprecated url routes for Geoserver authentication -- remove after GeoNode 2.1
# -- Use /gs/acls, gs/resolve_user/, gs/download instead
if 'geonode.geoserver' in settings.INSTALLED_APPS:
    geonode_layers_urlpatterns = patterns('',
                           url(r'^layers/acls/?$', layer_acls, name='layer_acls_dep'),
                           url(r'^layers/resolve_user/?$', resolve_user, name='layer_resolve_user_dep'),
                           url(r'^layers/download$', layer_batch_download, name='layer_batch_download_dep'),
                           )

layer_detail_patterns = patterns('',
    url(r'^layers/(?P<layerid>\d+)$', layer_detail_id, name="layer_detail_id"),
    url(r'^storylayer/(?P<layerid>\d+)$', layer_detail_id, name="storylayer_detail_id"),
    url(r'^layers/(?P<layername>[^/]*)$', layer_detail, name="layer_detail"),
    )

urlpatterns = patterns('',
    # Adding Threaded Comments app
    url(r'^articles/comments/', include('django_comments.urls')),
    url(r'^blog/comments/', include('fluent_comments.urls')),

    url(r'^$', IndexView.as_view(), name="index_view"),
    url(r'^accounts/profile/$', RedirectView.as_view(url=reverse_lazy('index_view'))), #temp fix for social auth redirect
    url(r"^account/signup/$", MapStorySignup.as_view(), name="account_signup"),
    url(r'^accounts/verify/$', 'mapstory.views.account_verify',  name='account_verify'),
    url(r"^account/confirm_email/(?P<key>\w+)/$", MapStoryConfirmEmailView.as_view(), name="account_confirm_email"),

    url(r'^maps/templates/story-about-info.html$', TemplateView.as_view(template_name='mapstory/composer/story-about-info.html'), name='composer-add-layers'),
    url(r'^maps/templates/add-layers.html$', TemplateView.as_view(template_name='mapstory/composer/add-layers.html'), name='composer-add-layers'),
    url(r'^maps/templates/layer-list.html$', TemplateView.as_view(template_name='mapstory/composer/layer-list.html'), name='composer-layer-list'),
    url(r'^maps/templates/load-map-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-map-dialog.html'), name='composer-load-map'),
    url(r'^maps/templates/load-search-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-search-dialog.html'), name='composer-load-search'),
    url(r'^maps/templates/load-new-map-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-new-map-dialog.html'), name='composer-load-new-map'),
    url(r'^maps/(?P<mapid>\d+)/boxes$', include('mapstory.apps.boxes.urls')),

    url(r'^maps/new/data$', 'mapstory.views.new_map_json', name='new_map_json'),

    url(r'^mapstory/(?P<mapid>\d+)/remove$', map_remove, name='map_remove'),
    url(r'^story/(?P<mapid>\d+)/?$', map_detail, name='mapstory_detail'),
    url(r'^story/(?P<storyid>\d+)/view$', 'mapstory.views.mapstory_view', name='mapstory_view'),
    # MapLoom

    url(r'^maps/new$',
        'mapstory.views.new_map', {'template': 'maps/_map_view_maploom.html'},
        name='map-new'),

    url(r'^maps/edit$',
        'geonode.maps.views.new_map', {'template': 'maps/_map_view_maploom.html'},
        name='map-edit'),

    url(r'^maps/(?P<mapid>\d+)/view$',
        'geonode.maps.views.map_view', {'template': 'maps/_map_view_maploom.html'},
        name='map-view'),

    url(r'^story/(?P<storyid>[^/]+)/draft$',
        'mapstory.views.mapstory_draft', {'template': 'maps/_map_view_maploom.html'},
        name='mapstory-draft'),

    # StoryTools

    url(r'^maps/(?P<mapid>\d+)/viewer$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_viewer.html'},
        name='map-viewer'),
    url(r'^maps/(?P<mapid>\d+)/embed$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_viewer.html'},
        name='map-viewer'),
    url(r'^story/(?P<mapid>\d+)/embed$',
        'geonode.maps.views.mapstory_view', {'template': 'maps/mapstory_map_viewer.html'},
        name='mapstory-viewer'),

    url(r"^storyteller/(?P<slug>[^/]*)/$", ProfileDetail.as_view(), name="profile_detail"),
    url(r"^storyteller/delete/(?P<username>[^/]*)/$", profile_delete, name="profile_delete"),
    url(r"^storyteller/edit/(?P<username>[^/]*)/$", profile_edit, name="edit_profile"),
    url(r"^storyteller/edit/(?P<username>[^/]*)/set-notification$", set_profile_notification, name="set_profile_notification"),
    url(r'^tours/editor_tour$', TemplateView.as_view(template_name='maps/editor_tour.html'), name='editor_tour'),

    url(r'^journal$', DiaryListView.as_view(), name='diary'),
    url(r'^journal/(?P<pk>\d+)$', DiaryDetailView.as_view(), name='diary-detail'),
    url(r'^journal/write$', login_required(DiaryCreateView.as_view()), name='diary-create'),
    url(r'^journal/write/(?P<pk>\d+)$', login_required(DiaryUpdateView.as_view()), name='diary-update'),

    url(r'^organizations/create/$', organization_create, name='organization_create'),
    url(r'^organizations/(?P<slug>[^/]*)$', organization_detail, name='organization_detail'),
    url(r'^organizations/edit/(?P<slug>[^/]*)$', organization_edit, name='organization_edit'),
    url(r'^organizations/members/(?P<slug>[^/]*)$', organization_members, name='organization_members'),
    url(r'^organizations/invite/(?P<slug>[^/]*)$', organization_invite, name='organization_invite'),
    url(r'^organizations/(?P<slug>[^/]*)/members_add/$', organization_members_add, name='organization_members_add'),
    url(r'^organizations/(?P<slug>[^/]*)/member_remove/(?P<username>.+)$', organization_member_remove,
        name='organization_member_remove'),
    url(r'^initiatives/create/$', initiative_create, name='initiative_create'),
    url(r'^initiatives/(?P<slug>[^/]*)$', initiative_detail, name='initiative_detail'),
    url(r'^initiatives/edit/(?P<slug>[^/]*)$', initiative_edit, name='initiative_edit'),
    url(r'^initiatives/members/(?P<slug>[^/]*)$', initiative_members, name='initiative_members'),
    url(r'^initiatives/invite/(?P<slug>[^/]*)$', initiative_invite, name='initiative_invite'),
    url(r'^initiatives/(?P<slug>[^/]*)/members_add/$', initiative_members_add, name='initiative_members_add'),
    url(r'^initiatives/(?P<slug>[^/]*)/member_remove/(?P<username>.+)$', initiative_member_remove, name='initiative_member_remove'),

    url(r'^get(?P<slug>\w+)$', GetPageView.as_view(), name='getpage'),
    url(r'^search/$', SearchView.as_view(), name='search'),
    url(r'^about/leadership$', LeaderListView.as_view(template_name='mapstory/leaders.html'), name='about-leaders'),
    url(r'^icons/', include('icon_commons.urls')),

    url(r'^donate$', LeaderListView.as_view(template_name='mapstory/donate.html'), name='donate'),
    url(r'^proxy/', proxy),
    url(r'^favorite/', include('geonode.contrib.favorite.urls')),
    url(r'^notifications/', include('notification.urls')),
    url(r'^layers/(?P<layername>[^/]*)/upload/metadata$', layer_metadata, name="layer_upload_metadata", kwargs={'template':'upload/layer_upload_metadata.html'}),

    url(r"^flag/", include('mapstory.apps.flag.urls')),

    url(r'^layers/upload$', layer_upload, name='layer_upload'),
    url(r'^layers/create$', layer_create, name='layer_create'),
    url(r'^layers/append$', layer_append, name='layer_append'),
    url(r'^layers/(?P<layername>[^/]*)/metadata$', layer_metadata, name="layer_metadata"),
    url(r'^layers/(?P<layername>[^/]*)/remove$', layer_remove, name="layer_remove"),
    url(r'^layers/(?P<layername>[^/]*)/replace$', layer_replace, name="layer_replace"),
    url(r'^layers/(?P<layername>[^/]*)/thumbnail$', layer_thumbnail, name='layer_thumbnail'),
    url(r'^layers/notify-download$', notify_download, name='notify-layer-download'),

) + geonode_layers_urlpatterns + layer_detail_patterns + urlpatterns

urlpatterns += maploom_urls
urlpatterns += importer_urlpatterns

if settings.DEBUG:
    urlpatterns = urlpatterns + patterns('',
        url(r'^testing/(?P<template>.*)$', 'mapstory.views.test_view'),
    )

if settings.LOCAL_CONTENT:
    urlpatterns = static(settings.STATIC_URL + "assets", document_root=settings.LOCAL_ROOT + "/../../mapstory-assets", show_indexes=True) + urlpatterns

if settings.ENABLE_SOCIAL_LOGIN:
    urlpatterns += patterns('',
        url(r'', include('social_auth.urls')),
        url(r'^oauth2/', include('provider.oauth2.urls', namespace = 'oauth2')),
    )
