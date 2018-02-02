import json
import requests
from .models import Map
from .models import MapStory


def save_mapstory(request):
    print request.POST
    config = json.loads(request.body)
    print config
    
    mapstory = MapStory.objects.get(id=config['id'])

    mapstory.title = config['about']['title']
    mapstory.abstract = config['about']['abstract']

    for index, chapter in enumerate(config['chapters']):
        map = Map.objects.get(id=config['chapters'][index]['map_id'])
        map.update_from_viewer(chapter)

    mapstory.save()
