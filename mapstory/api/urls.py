from geonode.api.urls import api

from mapstory.api.api import MapstoryOwnersResource
from mapstory.api.resourcebase_api import LayerResource, MapResource, DocumentResource, \
    ResourceBaseResource, FeaturedResourceBaseResource, MapStoryResource


api.register(LayerResource())
api.register(MapResource())
api.register(DocumentResource())
api.register(ResourceBaseResource())
api.register(FeaturedResourceBaseResource())
api.register(MapStoryResource())
api.register(MapstoryOwnersResource())
