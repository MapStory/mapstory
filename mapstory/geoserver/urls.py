from django.conf.urls import url

from mapstory.geoserver.views import geoserver_rest_proxy

urlpatterns = [
    url(r'^gs/rest/styles', geoserver_rest_proxy, dict(proxy_path='/gs/rest/styles',
                                                       downstream_path='rest/styles')),
    url(r'^rest/layers', geoserver_rest_proxy, dict(proxy_path='/gs/rest/layers',
                                                    downstream_path='rest/layers')),
    url(r'^rest/sldservice', geoserver_rest_proxy, dict(proxy_path='/gs/rest/sldservice',
                                                        downstream_path='rest/sldservice')),
]
