from django.conf import settings
from django.conf.urls import patterns
from django.conf.urls import url
from django.conf.urls import include
from django.conf.urls.static import static
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView
from django.views.generic import TemplateView

from storypins.urls import urlpatterns as storypins_urls
# to replace /api/base & /api/owners GeoNode routes with our own:
# unregister old routes before geonode.urls.urlpatterns is imported
from geonode.api.urls import api as geonode_api
geonode_api.unregister('owners')
geonode_api.unregister('base')
from geonode.geoserver.views import layer_acls, resolve_user, layer_batch_download
from geonode.urls import urlpatterns
from maploom.geonode.urls import urlpatterns as maploom_urls
from osgeo_importer.urls import urlpatterns as importer_urlpatterns
from tastypie.api import Api

from mapstory.api.api import MapstoryOwnersResource, InterestsResource
from mapstory.api.resourcebase_api import ResourceBaseResource
from mapstory.api.urls import api as mapstory_api
from mapstory.apps.favorite.urls import api as favorites_api
from mapstory.importers import UploadedLayerResource
from mapstory.notifications import notify_download, set_profile_notification
from mapstory.views import download_append_csv, download_append_shp
from mapstory.views import GetPageView
from mapstory.views import IndexView
from mapstory.views import LeaderListView
from mapstory.views import MapStoryConfirmEmailView
from mapstory.views import MapStorySignupView
from mapstory.views import layer_detail, layer_detail_id, layer_create
from mapstory.views import layer_acls_mapstory, resolve_user_mapstory
from mapstory.views import layer_remove, map_remove
from mapstory.views import map_detail
from mapstory.views import new_map
from mapstory.views import ProfileDetail, profile_delete, profile_edit, proxy
from mapstory.views import SearchView


geonode_api.register(ResourceBaseResource())
geonode_api.register(MapstoryOwnersResource())
geonode_api.register(InterestsResource())

importer_api = Api(api_name='importer-api')
# Overwrite Importer URL Routes
importer_api.register(UploadedLayerResource())

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
                       # Home
                       url(r'^$', IndexView.as_view(), name="index_view"),

                       # Adding Threaded Comments app
                       url(r'^articles/comments/', include('django_comments.urls')),

                       # Account
                       url(r"^account/signup/$", MapStorySignupView.as_view(), name="account_signup"),
                       url(r"^account/confirm_email/(?P<key>\w+)/$", MapStoryConfirmEmailView.as_view(), name="account_confirm_email"),

                       # Accounts
                       url(r'^accounts/profile/$', RedirectView.as_view(url=reverse_lazy('index_view'))),  #temp fix for social auth redirect
                       url(r'^accounts/verify/$', 'mapstory.views.account_verify',  name='account_verify'),

                       # Blog Comments
                       url(r'^blog/comments/', include('fluent_comments.urls')),

                       # Maps
                       url(r'^maps/(?P<mapid>\d+)/storyframes$', include('mapstory.apps.storyframes.urls')),
                       url(r'^maps/new/data$', 'mapstory.views.new_map_json', name='new_map_json'),
                       url(r'^maps/new_map', new_map, name='new_map'),
                       url(r'^maps/(?P<storyid>[^/]+)/save$', 'mapstory.views.save_story', name='save_story'),

                       # Health Check status
                       url(r'^status/', include('health_check.urls'), name='health_check'),

                       # Story
                       url(r'^story$', 'mapstory.views.new_story_json', name='new_story_json'),
                       url(r'^story/(?P<storyid>[^/]+)/save$', 'mapstory.views.save_story', name='save_story'),
                       url(r'^story/(?P<slug>[-\w]+)/$', map_detail, name='mapstory_detail'),
                       url(r'^story/(?P<slug>[-\w]+)/view$', 'mapstory.views.mapstory_view', name='mapstory_view'),
                       url(r'^story/chapter/new$', 'mapstory.views.new_map_json', name='new_map_json'),

                       # MapLoom
                       url(r'^story/new$', new_map, {'template': 'composer/maploom.html'},
        name='new-story'),
                       url(r'^maps/edit$', new_map, {'template': 'composer/maploom.html'}, name='map-edit'),
                       url(r'^maps/(?P<mapid>\d+)/view$', 'mapstory.views.map_view', {'template': 'composer/maploom.html'}, name='map-view'),
                       url(r'^story/(?P<slug>[-\w]+)/draft$',
    'mapstory.views.draft_view', {'template': 'composer/maploom.html'}, name='maploom-map-view'),
                       url(r'^frame/(?P<storyid>[^/]+)/draft','mapstory.views.draft_view',name='draft_view'),

                       # Composer-new
                       url(r'^story/(?P<slug>[-\w]+)/composer$',
        'mapstory.views.composer_new_view', {'template': 'composer_new/composer.html'}, name='composer-view'),

                       # StoryTools
                       url(r'^maps/(?P<mapid>\d+)/viewer$', 'mapstory.views.map_view', {'template': 'viewer/story_viewer.html'}, name='map-viewer'),
                       url(r'^maps/(?P<mapid>\d+)/embed$', 'mapstory.views.map_view', {'template': 'viewer/story_viewer.html'}, name='map-viewer'),
                       url(r'^story/(?P<slug>[-\w]+)/embed$', 'mapstory.views.mapstory_view', {'template': 'viewer/story_viewer.html'}, name='mapstory-viewer'),

                       url(r"^storyteller/delete/(?P<username>[^/]*)/$", profile_delete, name="profile_delete"),
                       url(r"^storyteller/edit/(?P<username>[^/]*)/$", profile_edit, name="edit_profile"),
                       url(r"^storyteller/edit/(?P<username>[^/]*)/set-notification$", set_profile_notification, name="set_profile_notification"),

                       url(r'^get(?P<slug>\w+)$', GetPageView.as_view(), name='getpage'),
                       url(r'^search/$', SearchView.as_view(), name='search'),
                       url(r'^about/leadership$', LeaderListView.as_view(template_name='mapstory/leaders.html'), name='about-leaders'),
                       url(r'^icons/', include('icon_commons.urls')),
                       url(r'^journal/', include('mapstory.apps.journal.urls')),

                       url(r'^donate$', LeaderListView.as_view(template_name='mapstory/donate.html'), name='donate'),
                       url(r'^proxy/', proxy),
                       url(r'^favorite/', include('mapstory.apps.favorite.urls')),
                       url(r'^notifications/', include('notification.urls')),

                       url(r"^flag/", include('mapstory.apps.flag.urls')),

                       url(r'^layers/create$', layer_create, name='layer_create'),
                       url(r'^layers/(?P<layername>[^/]*)/viewer$', layer_detail, {'template': 'viewer/layer_viewer.html'}, name="layer_viewer"),
                       url(r'^layers/(?P<layername>[^/]*)/remove$', layer_remove, name="layer_remove"),
                       url(r'^layers/notify-download$', notify_download, name='notify-layer-download'),
                       url(r'^layers/download-append-csv$', download_append_csv, name='download_append_csv'),
                       url(r'^layers/download-append-shp$', download_append_shp, name='download_append_shp'),
                       url(r'^layers/acls', layer_acls_mapstory, name='layer_acls_mapstory'),
                       url(r'^layers/resolve_user', resolve_user_mapstory, name='resolve_user_mapstory'),
                       url(r'^teams/', include('mapstory.apps.teams.urls', namespace='teams')),
                       url(r'^organizations/', include('mapstory.apps.organizations.urls', namespace='organizations')),
                       url(r'^initiatives/', include('mapstory.apps.initiatives.urls', namespace='initiatives')),
                       url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type="text/plain"), name='robots'),
                       ) + geonode_layers_urlpatterns + layer_detail_patterns + urlpatterns

urlpatterns += storypins_urls

urlpatterns += maploom_urls

urlpatterns += patterns("", url(r'', include(mapstory_api.urls)))

urlpatterns += patterns("", url(r'', include(importer_api.urls)))

urlpatterns += patterns("", url(r'', include(favorites_api.urls)))

urlpatterns += importer_urlpatterns

# this is last to catch reverse lookup from geonode views with the same name
urlpatterns += patterns("",
                        url(r"^storyteller/(?P<slug>[^/]*)/$", ProfileDetail.as_view(), name="profile_detail"),
                        url(r"^storyteller/edit/(?P<username>[^/]*)/$", profile_edit, name="profile_edit"),
                        url(r'^story/(?P<mapid>\d+)/remove$', map_remove, name='map_remove'))


if settings.DEBUG:
    urlpatterns = urlpatterns + patterns('',
        url(r'^testing/(?P<template>.*)$', 'mapstory.views.debug_view'),
    )

if settings.LOCAL_CONTENT:
    urlpatterns = static(settings.STATIC_URL + "assets", document_root=settings.LOCAL_ROOT + "/../../mapstory-assets", show_indexes=True) + urlpatterns

if settings.ENABLE_SOCIAL_LOGIN:
    urlpatterns += patterns('',
        url('', include('social.apps.django_app.urls', namespace='social')),
        url(r'^oauth2/', include('provider.oauth2.urls', namespace='oauth2')),
    )
