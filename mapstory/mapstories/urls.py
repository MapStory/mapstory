from django.conf.urls import url
from .views import save_mapstory, delete_mapstory


urlpatterns = [
    url(r'^mapstories/save$', save_mapstory, name='save_mapstory'),
    url(r'^mapstories/(?P<story_id>[^/]+)/delete$', delete_mapstory, name='delete_mapstory'),
]