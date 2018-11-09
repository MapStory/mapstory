from geonode.api.urls import api
from mapstory.api.api import InterestsResource, MapstoryOwnersResource
from mapstory.api.resourcebase_api import (FeaturedResourceBaseResource,
                                           MapStoryResource,
                                           ResourceBaseResource)

api.unregister('owners')
api.unregister('base')
api.register(ResourceBaseResource())
api.register(FeaturedResourceBaseResource())
api.register(MapStoryResource())
api.register(MapstoryOwnersResource())
api.register(InterestsResource())
