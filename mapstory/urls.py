from django.conf import settings
from django.conf.urls import patterns
from django.conf.urls import url
from django.conf.urls.static import static
from django.views.generic import TemplateView
from geonode.urls import urlpatterns

def placeholder(page_name):
    class WithContext(TemplateView):
        def get_context_data(self, **kwargs):
            context = super(WithContext, self).get_context_data(**kwargs)
            context['page_name'] = page_name
            return context
    return WithContext.as_view(template_name='_stub.html')

urlpatterns = patterns('',
    url(r'^maps/new2$',
        'geonode.maps.views.new_map', {'template': 'maps/mapstory_map_view.html'},
        name='map-new2'),
    url(r'^maps/(?P<mapid>\d+)/view2$',
        'geonode.maps.views.map_view', {'template': 'maps/mapstory_map_view.html'},
        name='map-view2'),
    url(r'^diary$', TemplateView.as_view(template_name='mapstory/diary.html'), name='diary'),
) + urlpatterns

if settings.DEBUG_STATIC:
    # prepend static route that loads maploom from build
    urlpatterns = static(settings.STATIC_URL + "maploom/", document_root=settings.LOCAL_ROOT + "/../../MapLoom/build", show_indexes=True) + urlpatterns
    # stick the vendor route first to pick up other assets not included in the 'build' when debugging static
    urlpatterns = static(settings.STATIC_URL + "maploom/vendor", document_root=settings.LOCAL_ROOT + "/../../MapLoom/vendor", show_indexes=True) + urlpatterns
