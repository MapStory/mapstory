from django.conf import settings
from django.conf.urls import patterns
from django.conf.urls import url
from django.conf.urls import include
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from geonode.urls import urlpatterns
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

urlpatterns = patterns('',
    url(r'^$', IndexView.as_view()),
    url(r"^account/signup/$", MapStorySignup.as_view(), name="account_signup"),
    url(r'^maps/templates/add-layers.html$', TemplateView.as_view(template_name='mapstory/composer/add-layers.html'), name='composer-add-layers'),
    url(r'^maps/templates/layer-list.html$', TemplateView.as_view(template_name='mapstory/composer/layer-list.html'), name='composer-layer-list'),
    url(r'^maps/templates/load-map-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-map-dialog.html'), name='composer-load-map'),
    url(r'^maps/templates/load-search-dialog.html$', TemplateView.as_view(template_name='mapstory/composer/load-search-dialog.html'), name='composer-load-search'),


    url(r'^maps/compose$',
        'geonode.maps.views.new_map', {'template': 'maps/composer_map_view.html'},
        name='story_create'),

    url(r'^maps/new2$',
        'geonode.maps.views.new_map', {'template': 'maps/_map_view_maploom.html'},
        name='map-new2'),

    url(r'^maps/(?P<mapid>\d+)/view2$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_view.html'},
        name='map-view2'),
    url(r'^maps/(?P<mapid>\d+)/viewer$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_viewer.html'},
        name='map-viewer'),
    url(r"^people/profile/(?P<slug>[^/]*)/$", ProfileDetail.as_view(), name="profile_detail"),
    url(r'^tours/editor_tour$', TemplateView.as_view(template_name='maps/editor_tour.html'), name='editor_tour'),

    url(r'^journal$', DiaryListView.as_view(), name='diary'),
    url(r'^journal/(?P<pk>\d+)$', DiaryDetailView.as_view(), name='diary-detail'),
    url(r'^journal/write$', login_required(DiaryCreateView.as_view()), name='diary-create'),
    url(r'^journal/write/(?P<pk>\d+)$', login_required(DiaryUpdateView.as_view()), name='diary-update'),

    url(r'^get(?P<slug>\w+)$', GetPageView.as_view(), name='getpage'),
    url(r'^search/$', SearchView.as_view(), name='search'),

    url(r'^storylayerpage$', TemplateView.as_view(template_name='mapstory/storylayerpage.html'), name='storylayerpage'),
    url(r'^mapstorypage$', TemplateView.as_view(template_name='mapstory/mapstorypage.html'), name='mapstorypage'),
    url(r'^about/leadership$', LeaderListView.as_view(template_name='mapstory/leaders.html'), name='about-leaders'),
    url(r'^icons/', include('icon_commons.urls')),

    url(r'^donate$', LeaderListView.as_view(template_name='mapstory/donate.html'), name='donate'),
    url(r'^proxy/', proxy),


) + urlpatterns

urlpatterns += maploom_urls

if settings.DEBUG:
    urlpatterns = urlpatterns + patterns('',
        url(r'^testing/(?P<template>.*)$', 'mapstory.views.test_view'),
    )


if settings.LOCAL_CONTENT:
    urlpatterns = static(settings.STATIC_URL + "assets", document_root=settings.LOCAL_ROOT + "/../../mapstory-assets", show_indexes=True) + urlpatterns

