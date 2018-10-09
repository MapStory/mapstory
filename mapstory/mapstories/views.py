import json
import requests

from django.core.urlresolvers import reverse
from django.db import transaction
from django.http import HttpResponse, HttpResponseRedirect

from .models import Map
from .models import MapStory
from .models import StoryFrame
from .models import StoryPin
from .utils import datetime_to_seconds, parse_date_time
from geonode.people.models import Profile


@transaction.atomic
def save_mapstory(request):
    config = json.loads(request.body)
    print config

    if config['storyID']:
        mapstory = MapStory.objects.get(pk=config['storyID'])
        print("Found a mapstory, it is", mapstory)
    else:
        mapstory = MapStory(owner=request.user)
        print("There was no MapStory, making a new one.", mapstory)

    mapstory.save()
    config['storyID'] = mapstory.id
    mapstory.update_from_viewer(conf=config)

    for index, chapter in enumerate(config['chapters']):

        config['chapters'][index]['storyID'] = mapstory.id

        if config['chapters'][index]['mapId']:
            currentChapter = Map.objects.get(pk=config['chapters'][index]['mapId'])
        else:
            currentChapter = Map(owner=request.user, zoom=0, center_x=0, center_y=0)

        currentChapter.save()
        currentChapter.update_from_viewer(conf=chapter)
        config['chapters'][index]['mapId'] = currentChapter.id

        if chapter['frames']:
            if chapter['frames']['features']:
                for index, frame in enumerate(chapter['frames']['features']):
                    if frame['id']:
                        currentFrame = StoryFrame.objects.get(pk=frame['id'])
                    else:
                        currentFrame = StoryFrame()

                    currentFrame.map_id = chapter['mapId']

                    start_time = datetime_to_seconds(parse_date_time(frame['properties']['start_time']))
                    end_time = datetime_to_seconds(parse_date_time(frame['properties']['end_time']))

                    currentFrame.center = frame['properties']['center']
                    currentFrame.end_time = end_time
                    currentFrame.start_time = start_time
                    currentFrame.title = frame['properties']['title']

                    currentFrame.save()
                    frame['id'] = currentFrame.id

        removed_frame_ids = config['removedFrames']
        if removed_frame_ids is not None:
            for frame_id in removed_frame_ids:
                frame_obj = StoryFrame.objects.get(id=frame_id)
                frame_obj.delete()

        if chapter['pins']['features']:
            for index, pin in enumerate(chapter['pins']['features']):
                if pin['id']:
                    currentPin = StoryPin.objects.get(pk=pin['id'])
                else:
                    currentPin = StoryPin()

                currentPin.map_id = chapter['mapId']

                start_time = datetime_to_seconds(parse_date_time(pin['properties']['start_time']))
                end_time = datetime_to_seconds(parse_date_time(pin['properties']['end_time']))

                currentPin.content = pin['properties']['content']
                currentPin.end_time = end_time
                currentPin.in_map = pin['properties']['inMap']
                currentPin.in_timeline = pin['properties']['inTimeline']
                currentPin.media = pin['properties']['media']
                currentPin.start_time = start_time
                currentPin.the_geom = json.dumps(pin['geometry'])
                currentPin.title = pin['properties']['title']
                currentPin.auto_play = pin['properties']['auto_play']
                currentPin.offset = pin['properties']['offset']
                currentPin.play_length = pin['properties']['play_length']

                currentPin.save()
                pin['id'] = currentPin.id

        removed_pin_ids = config['removedPins']
        if removed_pin_ids is not None:
            for pin_id in removed_pin_ids:
                pin_obj = StoryPin.objects.get(id=pin_id)
                pin_obj.delete()

    return HttpResponse(json.dumps(config))

@transaction.atomic
def delete_mapstory(request, story_id):
    mapstory = MapStory.objects.get(pk=story_id)
    if mapstory.owner == request.user:
        mapstory.delete()
        return HttpResponseRedirect(reverse("search"))
    else:
        return HttpResponse("Not allowed", status=403)
