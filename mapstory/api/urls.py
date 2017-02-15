from tastypie.api import Api

from resourcebase_api import MapStoryResource

api = Api(api_name='api')

api.register(MapStoryResource())
