from django.conf.urls import patterns

from geonode.urls import *
from maploom.geonode.urls import urlpatterns as maploom_urls

urlpatterns += maploom_urls
urlpatterns = patterns('',

) + urlpatterns
