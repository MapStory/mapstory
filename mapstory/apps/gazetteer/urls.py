from django.conf.urls import patterns, url


urlpatterns = patterns(
    'mapstory.apps.gazetteer.views',
    url(r'^location/(?P<locid>\d+)$', 'getloc'),
    url(r'^location/(?P<locid>\d+)/recordname$', 'recordname'),
)
