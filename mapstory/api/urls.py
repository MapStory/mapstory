from resourcebase_api import MapStoryResource, ResourceBaseResource
from api import MapstoryOwnersResource
from geonode.api.urls import api

api.register(MapStoryResource())
api.register(MapstoryOwnersResource())
api.register(ResourceBaseResource())
