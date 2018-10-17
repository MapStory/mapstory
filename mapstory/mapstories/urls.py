from django.conf.urls import url

from geonode.maps.views import new_map

from .views import (composer_new_view, delete_mapstory, map_detail,
                    mapstory_view, save_mapstory, story_generate_thumbnail)

urlpatterns = [
    url(r'^mapstories/save$', save_mapstory, name='save_mapstory'),
    url(r'^mapstories/(?P<story_id>[^/]+)/delete$',
        delete_mapstory, name='delete_mapstory'),

    # Story
    url(r'^story/(?P<storyid>[^/]+)/generate_thumbnail',
        story_generate_thumbnail, name='story_generate_thumbnail'),
    url(r'^story/(?P<slug>[-\w]+)/$',
        map_detail, name='mapstory_detail'),
    url(r'^story/(?P<slug>[-\w]+)/view$',
        mapstory_view, name='mapstory_view'),
    url(r'^story/(?P<slug>[-\w]+)/embed$',
        mapstory_view, name='mapstory_view'),

    # Composer
    url(r'^story/(?P<slug>[-\w]+)/draft$',
        composer_new_view, {'template': 'composer_new/composer.html'}, name='composer-view'),
    url(r'^story/new$', new_map,
        {'template': 'composer_new/composer.html'}, name='new-story'),
]
