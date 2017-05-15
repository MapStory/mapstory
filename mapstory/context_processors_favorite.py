import re
from geonode.layers.models import Layer

from mapstory.apps.favorite.utils import get_favorite_info as geonode_get_favorite_info
from mapstory.mapstories.models import MapStory, Map

# based on urls.py
layer_detail_path = re.compile('/layers/[^/]*$')
map_detail_path = re.compile('/maps/\d+$')
story_detail_path = re.compile('/story/\d+$')


def get_favorite_info(request):
    """
    If user is authenticated and the request is for map or layer detail,
    get its favorite info.
    """
    # if user is not authenticated, no favorite info.
    if not request.user.is_authenticated():
        return None

    object_of_interest = get_object_of_interest(request)

    # if object not found, no favorite info.
    if not object_of_interest:
        return None

    return geonode_get_favorite_info(request.user, object_of_interest)


def get_object_of_interest(request):
    """
    If the request is for Map or Layer detail, get the object.
    If not a corresponding request, or if object not found, return None.
    TODO add logging for the DoesNotExist and MultipleObjectReturned paths.
    """
    # if identify as map detail request.
    if re.match(map_detail_path, request.path):
        map_id = request.path.split('/')[2]
        try:
            return Map.objects.get(id=map_id)
        except Map.DoesNotExist:
            return None
        except Map.MultipleObjectsReturned:
            return None
    # if identify as mapstory detail request.
    if re.match(story_detail_path, request.path):
        story_id = request.path.split('/')[2]
        try:
            return MapStory.objects.get(id=story_id)
        except MapStory.DoesNotExist:
            return None
        except MapStory.MultipleObjectsReturned:
            return None
    # if identify as layer detail request.
    elif re.match(layer_detail_path, request.path):
        layer_info = request.path.split('/')[2]
        workspace_separator_position = layer_info.find(':')
        if workspace_separator_position == -1:
            name = layer_info
            try:
                return Layer.objects.get(name=name)
            except Layer.DoesNotExist:
                return None
            except Layer.MultipleObjectsReturned:
                return None
        else:
            workspace = layer_info[0:workspace_separator_position]
            name = layer_info[workspace_separator_position+1:]
            try:
                return Layer.objects.get(workspace=workspace, name=name)
            except Layer.DoesNotExist:
                return None
            except Layer.MultipleObjectsReturned:
                return None

    # all other requests.
    return None
