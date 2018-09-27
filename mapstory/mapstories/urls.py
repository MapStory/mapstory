from django.conf.urls import url
from .views import save_mapstory


urlpatterns = [
    url(r'^mapstories/save$', save_mapstory, name='save_mapstory'),
]