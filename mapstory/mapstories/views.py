import json
import requests

from django.http import HttpResponse

from .models import Map
from .models import MapStory
from geonode.people.models import Profile


def save_mapstory(request):
    config = json.loads(request.body)
    print config

    owner = Profile.objects.get(username=request.user)

    if config['storyId']:
        mapstory = MapStory(pk=config['storyId'], owner=owner)
    else:
        mapstory = MapStory(owner=owner)

    mapstory.save()
    
    mapstory.update_from_viewer(conf=config)

    # for index, chapter in enumerate(config['chapters']):
    #     map = Map.objects.get(pk=config['chapters'][index]['mapId'])
    #     map.update_from_viewer(chapter)

    config['storyId'] = mapstory.id

    return HttpResponse(json.dumps(config))


