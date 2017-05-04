from mapstory.api.resourcebase_api import LayerResource, MapResource, DocumentResource, \
    ResourceBaseResource, FeaturedResourceBaseResource, MapStoryResource
from mapstory.api.api import MapstoryOwnersResource
from geonode.api.urls import api

api.register(LayerResource())
api.register(MapResource())
api.register(DocumentResource())
api.register(ResourceBaseResource())
api.register(FeaturedResourceBaseResource())
api.register(MapStoryResource())
api.register(MapstoryOwnersResource())
