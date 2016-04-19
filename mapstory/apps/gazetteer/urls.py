from django.conf.urls import patterns, url


urlpatterns = patterns(
    'mapstory.apps.gazetteer.views',
    url(r'location/(?P<locid>\d+)$', 'getloc', name='getloc'),
    url(r'location/(?P<locid>\d+)/recordname$', 'recordname', name='recordname'),
    url(r'location/matchloc$', 'matchloc', name='matchloc'),
    url(r'location/updateloc$', 'updateloc', name='updateloc'),
    
    url(r'harvest/(?P<layerid>\d+)$','harvestlayer',name='harvestlayer'),
#    url(r'^location/matchloc$', include(patterns('',
#        url(r'^(?P<name>\+)$', 'recordname', name='recordname'),
#    ))),
)
