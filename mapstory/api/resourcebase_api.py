from django.conf import settings
from geonode.api.resourcebase_api import CommonModelApi, CommonMetaApi
from mapstory.mapstories.models import MapStory


class MapStoryResource(CommonModelApi):
    """MapStory API"""

    class Meta(CommonMetaApi):
        queryset = MapStory.objects.distinct().order_by('-date')
        if settings.RESOURCE_PUBLISHING:
            queryset = queryset.filter(is_published=True)
        resource_name = 'mapstories'


