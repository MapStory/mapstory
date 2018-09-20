import json
import requests

from django.http import HttpResponse

from .models import Map
from .models import MapStory
from geonode.people.models import Profile


def save_mapstory(request):
    config = json.loads(request.body)
    print config

    if config['storyID']:
        mapstory = MapStory.objects.get(pk=config['storyID'])
    else:
        mapstory = MapStory(owner=request.user)

    mapstory.save()
    config['storyID'] = mapstory.id
    mapstory.update_from_viewer(conf=config)

    for index, chapter in enumerate(config['chapters']):

        config['chapters'][index]["storyID"] = mapstory.id

        if config['chapters'][index]['mapId']:
            currentChapter = Map.objects.get(pk=config['chapters'][index]['mapId'])
        else:
            currentChapter = Map(owner=request.user, zoom=0, center_x=0, center_y=0)

        currentChapter.save()
        currentChapter.update_from_viewer(conf=chapter)
        config['chapters'][index]['mapId'] = currentChapter.id


    return HttpResponse(json.dumps(config))


