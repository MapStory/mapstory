from django.conf.urls import url, include

from . import api

resource = api.TeamResource()

urlpatterns = [
    url(r'^api/', include(resource.urls)),
]
