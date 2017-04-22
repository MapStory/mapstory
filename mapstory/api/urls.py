from resourcebase_api import MapStoryResource
from api import MapstoryOwnersResource
from geonode.api.urls import api

api.register(MapStoryResource())
api.register(MapstoryOwnersResource())
