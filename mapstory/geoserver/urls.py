from django.conf.urls import patterns, url

urlpatterns = patterns('mapstory.geoserver.views',
                       url
                       (r'^gs/rest/styles', 'geoserver_rest_proxy', dict(proxy_path='/gs/rest/styles',
                                                                         downstream_path='rest/styles')),
                       (r'^rest/layers', 'geoserver_rest_proxy', dict(proxy_path='/gs/rest/layers',
                                                                      downstream_path='rest/layers')),
                       (r'^rest/sldservice', 'geoserver_rest_proxy', dict(proxy_path='/gs/rest/sldservice',
                                                                          downstream_path='rest/sldservice')),
                       )
