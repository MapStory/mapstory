from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.views.generic import TemplateView
from geonode.maps.views import map_view
from geonode.urls import urlpatterns as geonode_urls
from osgeo_importer.urls import urlpatterns as importer_urlpatterns
from tastypie.api import Api

from mapstory.api.urls import api as mapstory_api
from mapstory.geoserver.urls import urlpatterns as geoserver_urls
from mapstory.importers import UploadedLayerResource
from mapstory.mapstories.urls import urlpatterns as mapstories_urls
from mapstory.mapstory_profile.urls import urlpatterns as mapstory_profile_urls
from mapstory.storylayers.urls import urlpatterns as layers_urls
from mapstory.views import (GetPageView, IndexView, LeaderListView, SearchView,
                            baselayer_view, maploom_new_map)

importer_api = Api(api_name='importer-api')
# Overwrite Importer URL Routes
importer_api.register(UploadedLayerResource())

urlpatterns = [
    # Home
    url(r'^$', IndexView.as_view(), name="index_view"),

    # Adding Threaded Comments app
    url(r'^articles/comments/',
        include('django_comments.urls')),

    # Blog Comments
    url(r'^blog/comments/', include('fluent_comments.urls')),

    # Editor
    url(r'^maps/edit$', maploom_new_map,
        {'template': 'composer/maploom.html'}, name='map-edit'),
    url(r'^maps/(?P<mapid>\d+)/view$', map_view,
        {'template': 'composer/maploom.html'}, name='map-view'),

    url(r'^get(?P<slug>\w+)$',
        GetPageView.as_view(), name='getpage'),
    url(r'^search/$', SearchView.as_view(), name='search'),
    url(r'^about/leadership$', LeaderListView.as_view(
        template_name='mapstory/leaders.html'), name='about-leaders'),
    url(r'^icons/', include('icon_commons.urls')),
    url(r'^journal/', include('mapstory.journal.urls')),

    url(r'^donate$', LeaderListView.as_view(
        template_name='mapstory/donate.html'), name='donate'),
    url(r"^flag/", include('mapstory.flag.urls')),

    url(r'^teams/', include(('mapstory.teams.urls', 'teams'))),
    url(r'^organizations/', include(('mapstory.organizations.urls', 'organizations'))),
    url(r'^initiatives/', include(('mapstory.initiatives.urls', 'initiatives'))),
    url(r'^robots\.txt$', TemplateView.as_view(
        template_name='robots.txt', content_type="text/plain"), name='robots'),
    url(r'^baselayers$',
        baselayer_view, name='baselayer_view'),
]

urlpatterns += [url(r'', include(mapstory_api.urls))]

urlpatterns += geoserver_urls

urlpatterns += layers_urls

urlpatterns += geonode_urls

urlpatterns += mapstories_urls

urlpatterns += mapstory_profile_urls

urlpatterns += [url(r'', include(importer_api.urls))]

urlpatterns += importer_urlpatterns

if settings.LOCAL_CONTENT:
    urlpatterns = static(settings.STATIC_URL + "assets", document_root=settings.LOCAL_ROOT +
                                                                       "/../../mapstory-assets",
                         show_indexes=True) + urlpatterns

urlpatterns += [url(r'^accounts/', include('allauth.urls'))]
