import json

import requests
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound
from django.shortcuts import render, render_to_response
from django.template import RequestContext
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from geonode.documents.models import get_related_documents
from geonode.groups.models import GroupProfile
from geonode.layers.views import _PERMISSION_MSG_GENERIC
from geonode.maps.models import MapLayer
from geonode.maps.views import (_PERMISSION_MSG_LOGIN, _PERMISSION_MSG_SAVE,
                                _PERMISSION_MSG_VIEW, add_layers_to_map_config,
                                snapshot_config)
from geonode.people.models import Profile
from geonode.security.views import _perms_info_json
from geonode.utils import build_social_links, resolve_object
from guardian.shortcuts import get_perms
from mapstory.favorite.utils import get_favorite_info
from mapstory.forms import KeywordsForm, PublishStatusForm
from mapstory.initiatives.models import InitiativeMembership
from mapstory.models import Baselayer, BaselayerDefault
from mapstory.organizations.models import (OrganizationMapStory,
                                           OrganizationMembership)
from mapstory.search.utils import update_es_index
from mapstory.thumbnails.tasks import create_mapstory_thumbnail_tx_aware

from geonode.maps.views import new_map_config

from .models import Map, MapStory, StoryFrame, StoryPin, LayerStyle
from .utils import datetime_to_seconds, parse_date_time


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
    config['about']['slug'] = mapstory.slug

    for index, chapter in enumerate(config['chapters']):

        config['chapters'][index]['storyID'] = mapstory.id

        if config['chapters'][index]['mapId']:
            currentChapter = Map.objects.get(
                pk=config['chapters'][index]['mapId'])
        else:
            currentChapter = Map(owner=request.user,
                                 zoom=0, center_x=0, center_y=0)

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

                    start_time = datetime_to_seconds(
                        parse_date_time(frame['properties']['startTime']))
                    end_time = datetime_to_seconds(
                        parse_date_time(frame['properties']['endTime']))

                    currentFrame.center = frame['properties']['center']
                    currentFrame.end_time = end_time
                    currentFrame.start_time = start_time
                    currentFrame.title = frame['properties']['title']

                    currentFrame.save()
                    frame['id'] = currentFrame.id

        if chapter['pins']['features']:
            for index, pin in enumerate(chapter['pins']['features']):
                if pin['id']:
                    currentPin = StoryPin.objects.get(pk=pin['id'])
                else:
                    currentPin = StoryPin()

                currentPin.map_id = chapter['mapId']

                start_time = datetime_to_seconds(
                    parse_date_time(pin['properties']['startTime']))
                end_time = datetime_to_seconds(
                    parse_date_time(pin['properties']['endTime']))

                currentPin.content = pin['properties']['content']
                currentPin.end_time = end_time
                currentPin.in_map = pin['properties']['inMap']
                currentPin.in_timeline = pin['properties']['inTimeline']
                currentPin.media = pin['properties']['media']
                currentPin.start_time = start_time
                currentPin.the_geom = json.dumps(pin['geometry'])
                currentPin.title = pin['properties']['title']
                currentPin.auto_play = pin['properties']['autoPlay']
                currentPin.offset = pin['properties']['offset']
                currentPin.play_length = pin['properties']['playLength']

                currentPin.save()
                pin['id'] = currentPin.id

        removed_pin_ids = chapter['removedPins']
        if removed_pin_ids is not None:
            for pin_id in removed_pin_ids:
                pin_obj = StoryPin.objects.get(id=pin_id)
                pin_obj.delete()

    removed_frame_ids = config['removedFrames']
    if removed_frame_ids is not None:
        for frame_id in removed_frame_ids:
            frame_obj = StoryFrame.objects.get(id=frame_id)
            frame_obj.delete()

    return HttpResponse(json.dumps(config))


@transaction.atomic
def delete_mapstory(request, story_id):
    mapstory = MapStory.objects.get(pk=story_id)
    if mapstory.owner == request.user:
        mapstory.delete()
        return HttpResponseRedirect(reverse("search"))
    else:
        return HttpResponse("Not allowed", status=403)


def mapstory_view(request, slug, snapshot=None, template='composer_new/composer.html'):
    """
    The view that returns the map viewer opened to
    the mapstory with the given ID.
    """

    story_obj = _resolve_map(
        request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        access_token = None

    if snapshot is None:
        config = story_obj.viewer_json(request, access_token)
    else:
        config = snapshot_config(snapshot, story_obj, request.user)

    config['about']['detail_url'] = slug

    layers = json.dumps({"defaultLayer": BaselayerDefault.objects.first().layer.name,
                                    "layers":  map(lambda x: x.to_object(), Baselayer.objects.all())})

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'composerMode': False,
        'layers': layers
    }))


# TODO this should be moved to a mapstory.util
def _resolve_story(request, id, permission='base.change_resourcebase',
                   msg=_PERMISSION_MSG_GENERIC, **kwargs):
    '''
    Resolve the Map by the provided typename and check the optional permission.
    '''
    if id.isdigit():
        key = 'pk'
    else:
        key = 'slug'
    return resolve_object(request, MapStory, {key: id}, permission=permission,
                          permission_msg=msg, **kwargs)

# request a (future) story thumbnail to be created
# we only allow  PUT/POST since this modifies data


@require_http_methods(["PUT", "POST"])
@csrf_exempt
def story_generate_thumbnail(request, storyid):
    if not request.user.is_authenticated():
        return HttpResponse(
            _PERMISSION_MSG_LOGIN,
            status=401,
            content_type="text/plain"
        )

    story_obj = MapStory.objects.get(id=storyid)
    if not request.user.has_perm('change_resourcebase', story_obj.get_self_resource()):
        return HttpResponse(
            _PERMISSION_MSG_SAVE,
            status=401,
            content_type="text/plain"
        )
    create_mapstory_thumbnail_tx_aware(story_obj, True)
    return HttpResponse("create story thumbnail task was scheduled for story id="+str(story_obj.id)+", with uuid="+str(story_obj.uuid))


def composer_new_view(request, template='composer_new/composer.html'):
    map_obj, config = new_map_config(request)
    layers = json.dumps({"defaultLayer": BaselayerDefault.objects.first().layer.name,
                                    "layers":  map(lambda x: x.to_object(), Baselayer.objects.all())})

    return render_to_response(template, RequestContext(request, {
        'layers': layers,
        'config': config,
        'map': map
    }))

def composer_view(request, slug, template='composer_new/composer.html'):
    story_obj = _resolve_story(
        request, slug, 'base.change_resourcebase', _PERMISSION_MSG_SAVE)
    config = story_obj.viewer_json(request)

    layers = json.dumps({"defaultLayer": BaselayerDefault.objects.first().layer.name,
                                    "layers":  map(lambda x: x.to_object(), Baselayer.objects.all())})

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'story': story_obj,
        'layers': layers
    }))


def _resolve_map(request, id, permission='base.change_resourcebase',
                 msg=_PERMISSION_MSG_GENERIC, **kwargs):
    '''
    Resolve the Map by the provided typename and check the optional permission.
    '''
    if id.isdigit():
        key = 'pk'
    else:
        key = 'slug'
    map_obj = resolve_object(request, MapStory, {key: id}, permission=permission,
                             permission_msg=msg, **kwargs)
    return map_obj


def map_detail(request, slug, snapshot=None, template='maps/map_detail.html'):
    '''
    The view that show details of each map
    '''
    # MapStory specific change from mapid parameter to slug parameter
    map_obj = _resolve_map(
        request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    if request.user != map_obj.owner and not request.user.is_superuser:
        Map.objects.filter(
            id=map_obj.id).update(
            popular_count=F('popular_count') + 1)

    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        access_token = None

    if snapshot is None:
        config = map_obj.viewer_json(request, access_token)
    else:
        config = snapshot_config(snapshot, map_obj, request.user, access_token)

    config = json.dumps(config)
    layers = MapLayer.objects.filter(map=map_obj.id)
    links = map_obj.link_set.download()

    group = None
    if map_obj.group:
        try:
            group = GroupProfile.objects.get(slug=map_obj.group.name)
        except GroupProfile.DoesNotExist:
            group = None

    ###
    # MapStory Specific Changes
    ###

    chapters = map_obj.chapters
    # Overwrite the layers list so that we can add all layers from all chapters.
    layers = []
    for chapter in chapters:
        layers = layers + list(chapter.local_layers)

    keywords = json.dumps([tag.name for tag in map_obj.keywords.all()])

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=map_obj)
        published_form = PublishStatusForm(instance=map_obj)
        if 'keywords' in request.POST:
            if keywords_form.is_valid():
                new_keywords = keywords_form.cleaned_data['keywords']
                map_obj.keywords.add(*new_keywords)
                map_obj.save()
            published_form = PublishStatusForm(instance=map_obj)
        elif 'published_submit_btn' in request.POST:
            published_form = PublishStatusForm(request.POST, instance=map_obj)
            if published_form.is_valid():
                published_form.save()
                map_obj.is_published = published_form.cleaned_data['is_published']
                map_obj.save()
            keywords_form = KeywordsForm(instance=map_obj)
        elif 'add_keyword' in request.POST:
            map_obj.keywords.add(request.POST['add_keyword'])
            map_obj.save()
        elif 'remove_keyword' in request.POST:
            map_obj.keywords.remove(request.POST['remove_keyword'])
            map_obj.save()
    else:
        keywords_form = KeywordsForm(instance=map_obj)
        published_form = PublishStatusForm(instance=map_obj)

    map_thumbnail = map_obj.get_thumbnail_url
    update_es_index(MapStory, MapStory.objects.get(id=map_obj.id))

    # This will get URL encoded later and is used for the social media share URL
    share_url = "https://%s/story/%s" % (request.get_host(), map_obj.slug)
    share_title = "%s by %s." % (map_obj.title, map_obj.owner)
    share_description = map_obj.abstract

    # Check if user is admin in one of those organizations
    org_admin_memberships = []
    memberships = OrganizationMembership.objects.filter(
        user_id=request.user.pk)
    for membership in memberships.all():
        if membership.is_admin:
            org_admin_memberships.append(membership)

    if len(org_admin_memberships) < 1:
        org_admin_memberships = None

    ini_memberships = InitiativeMembership.objects.filter(
        user_id=request.user.pk)
    ini_admin_memberships = []
    for m in ini_memberships.all():
        if m.is_admin:
            ini_admin_memberships.append(m)

    if len(ini_admin_memberships) < 1:
        ini_admin_memberships = None

    ###
    # End MapStory Specific Changes
    ###

    context_dict = {
        'config': config,
        'resource': map_obj,
        'group': group,
        'layers': layers,
        'perms_list': get_perms(request.user, map_obj.get_self_resource()),
        'permissions_json': _perms_info_json(map_obj),
        "documents": get_related_documents(map_obj),
        'links': links,
        # MapStory Specific Additions
        'keywords': keywords,
        'keywords_form': keywords_form,
        'published_form': published_form,
        'thumbnail': map_thumbnail,
        'share_url': share_url,
        'share_title': share_title,
        'share_description': share_description,
        'organizations': org_admin_memberships,
        'initiatives': ini_admin_memberships,
    }

    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    context_dict["crs"] = getattr(
        settings,
        'DEFAULT_MAP_CRS',
        'EPSG:900913')

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, map_obj)

    # Favorites
    if request.user.is_authenticated():
        context_dict["favorite_info"] = get_favorite_info(
            request.user, map_obj)

    return render(request, template, context=context_dict)


def style_view(request, story_id, style_id):
    map_story = MapStory.objects.get(pk=story_id)
    if request.method == 'GET':
        layer_style = LayerStyle.objects.filter(map_story=map_story, style_id=style_id)
        if layer_style.exists():
            return HttpResponse(layer_style[0].style)

        return HttpResponseNotFound()

    layer_style = LayerStyle.objects.filter(map_story=map_story, style_id=style_id)
    if not layer_style.exists():
        LayerStyle(style_id=style_id, map_story=map_story, style=request.body).save()
        return HttpResponse(json.dumps({'success': True}))

    layer_style = layer_style[0]
    layer_style.style = request.body
    layer_style.save()
    return HttpResponse(json.dumps({'success': True}))
