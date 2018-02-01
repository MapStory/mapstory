import json
import requests
from .models import Map
from .models import MapStory


def save_mapstory(request):
    print "WE HIT SAVE MAPSTORY"
    print request.POST
    config = json.loads(request.body)
    print config
    
    mapstory = MapStory.objects.get(id=config['id'])

    mapstory.title = config['about']['title']
    mapstory.abstract = config['about']['abstract']
    
    for index, chapter in enumerate(mapstory.chapters):
        map = Map.objects.get(id=config['chapters'][index]['map_id'])
        map.title = config['chapters'][index]['about']['title']
        map.abstract = config['chapters'][index]['about']['abstract']
        map.save()

    mapstory.save()

    print mapstory.title
    print mapstory.abstract