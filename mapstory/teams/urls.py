from django.conf.urls import include, url

from . import api

resource = api.TeamResource()

urlpatterns = [
    url(r'^api/', include(resource.urls)),
]
