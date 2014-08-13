from django.conf import settings
from django.conf.urls import patterns
from django.conf.urls import url
from django.conf.urls.static import static
from geonode.urls import urlpatterns

urlpatterns = patterns('',
    url(r'^maps/new2$',
        'geonode.maps.views.new_map', {'template': 'maps/mapstory_map_view.html'},
        name='map-new2'),
    url(r'^maps/(?P<mapid>\d+)/view2$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_view.html'},
        name='map-view2'),
) + urlpatterns

if settings.DEBUG_STATIC:
    # prepend static route that loads maploom from build
    urlpatterns = static(settings.STATIC_URL + "maploom/", document_root=settings.LOCAL_ROOT + "/../../MapLoom/build", show_indexes=True) + urlpatterns
    urlpatterns = static(settings.STATIC_URL + "maploom/vendor", document_root=settings.LOCAL_ROOT + "/../../MapLoom/vendor", show_indexes=True) + urlpatterns
