import contextlib
import csv
import datetime
from httplib import HTTPConnection, HTTPSConnection
import json
import logging
import math
import ogr
import os
import pandas
import shutil
import StringIO
import tempfile
from urlparse import urlsplit
import uuid
import zipfile

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.core.mail import EmailMultiAlternatives
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import F
from django.http import HttpResponse, HttpResponseServerError, Http404
from django.http import HttpResponseRedirect, HttpResponseForbidden
from django.http.request import validate_host
from django.shortcuts import render_to_response, render, redirect, get_object_or_404
from django.template import RequestContext
from django.template import loader
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.utils.http import is_safe_url
from django.utils.timezone import now as provider_now
from django.utils.translation import ugettext as _
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView

import requests
from actstream.models import actor_stream
from allauth.account.adapter import DefaultAccountAdapter
from geonode import geoserver
from geonode.base.models import TopicCategory, Region
from geonode.documents.models import get_related_documents
from geonode.geoserver.helpers import ogc_server_settings
from geonode.groups.models import GroupProfile
from geonode.layers.models import Layer
from geonode.layers.views import _PERMISSION_MSG_GENERIC, _PERMISSION_MSG_VIEW, _PERMISSION_MSG_DELETE
from geonode.geoserver.views import layer_acls, resolve_user
from geonode.layers.views import _resolve_layer
from geonode.maps.views import clean_config, map_json, snapshot_config, _PERMISSION_MSG_SAVE, _PERMISSION_MSG_LOGIN
from geonode.maps.views import add_layers_to_map_config
from geonode.maps.models import MapLayer, MapSnapshot
from geonode.people.models import Profile
from geonode.security.views import _perms_info_json
from geonode.layers.tasks import delete_layer
from geonode.utils import GXPLayer, GXPMap, resolve_object, bbox_to_projection, check_ogc_backend
from geonode.utils import build_social_links
from geonode.utils import default_map_config
from geonode.utils import forward_mercator, llbbox_to_mercator
from geonode.utils import DEFAULT_TITLE
from geonode.utils import DEFAULT_ABSTRACT
from guardian.shortcuts import get_perms
from icon_commons.models import Icon
from lxml import etree
from osgeo_importer.utils import UploadError, launder
from osgeo_importer.forms import UploadFileForm
from requests import Request
from user_messages.models import Thread

from apps.journal.models import JournalEntry
from mapstory.apps.favorite.models import Favorite
from mapstory.apps.initiatives.models import InitiativeMembership, InitiativeLayer, InitiativeMapStory
from mapstory.apps.organizations.models import OrganizationMembership, OrganizationLayer, OrganizationMapStory
from mapstory.forms import DeactivateProfileForm, EditMapstoryProfileForm, EditGeonodeProfileForm
from mapstory.forms import KeywordsForm, MetadataForm, PublishStatusForm, DistributionUrlForm
from mapstory.importers import GeoServerLayerCreator
from mapstory.mapstories.models import MapStory, Map
from mapstory.models import GetPage
from mapstory.models import Leader
from mapstory.models import NewsItem
from mapstory.models import get_sponsors, get_images
from mapstory.search.utils import update_es_index
from mapstory.utils import DEFAULT_VIEWER_PLAYBACKMODE
from mapstory.utils import has_exception, parse_wfst_response, print_exception
from mapstory.apps.favorite.utils import get_favorite_info
from tasks import delete_mapstory
from mapstory.apps.thumbnails.tasks import create_mapstory_thumbnail_tx_aware
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger("geonode.layers.views")

class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        news_items = NewsItem.objects.filter(date__lte=datetime.datetime.now())
        ctx['news_items'] = news_items[:3]
        ctx['images'] = get_images()
        # for now, limit to max of 8.
        ctx['journal_entries'] = JournalEntry.objects.filter(publish=True, show_on_main=True)[:8]

        return ctx

class CustomAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        path = "/storyteller/edit/{username}/"
        return path.format(username=request.user.username)

class GetPageView(DetailView):
    template_name = 'mapstory/getpage.html'
    model = GetPage
    slug_field = 'name'


class SearchView(TemplateView):
    template_name = 'search/explore.html'

    def get_context_data(self, **kwargs):
        context = super(TemplateView, self).get_context_data(**kwargs)
        context['regions'] = Region.objects.filter(level=1)
        return context


class ProfileDetail(DetailView):
    model = Profile
    template_name = 'people/profile_detail.html'
    slug_field = 'username'

    def get_context_data(self, **kwargs):
        ctx = super(ProfileDetail, self).get_context_data(**kwargs)
        ctx['journal_entries'] = JournalEntry.objects.filter(author=self.object).order_by('-date')
        ctx['journal_entries_total'] = JournalEntry.objects.filter(author=self.object).count()
        ctx['journal_entries_published'] = JournalEntry.objects.filter(author=self.object, publish=True).count()
        ctx['favorites'] = Favorite.objects.filter(user=self.object).order_by('-created_on')
        ctx['icons'] = Icon.objects.filter(owner=self.object)
        ctx['action_list'] = actor_stream(ctx['profile'])
        # need to render the form
        ctx['form'] = UploadFileForm()
        ctx['interests'] = json.dumps(self.object.mapstoryprofile.interests_slug_list())

        return ctx


@login_required
def profile_edit(request, username=None):
    # TODO this if/else needs updated for mapstoryprofile
    if username is None:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return redirect("profile_browse")
    else:
        profile = get_object_or_404(Profile, username=username)

    if username == request.user.username:
        if request.method == "POST":
            geonode_form = EditGeonodeProfileForm(request.POST,
                                                  instance=request.user)
            mapstory_form = EditMapstoryProfileForm(request.POST,
                                                    instance=request.user.mapstoryprofile)
            if geonode_form.is_valid() and mapstory_form.is_valid():
                geonode_form.save()
                mapstory_form.save()
                messages.success(request, "Profile profile updated.")
                return redirect(
                    reverse(
                        'profile_detail',
                        args=[
                            request.user.username]))
        else:
            geonode_form = EditGeonodeProfileForm(instance=request.user)
            mapstory_form = EditMapstoryProfileForm(instance=request.user.mapstoryprofile)

        return render(request, "people/profile_edit.html", {
            "geonode_profile_form": geonode_form,
            "mapstory_profile_form": mapstory_form
        })
    else:
        return HttpResponseForbidden(
            'You are not allowed to edit other users profile')


@login_required
def profile_delete(request, username=None):
    if username is None:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return redirect("profile_browse")
    else:
        profile = get_object_or_404(Profile, username=username)

    if username == request.user.username:
        if request.method == "POST":
            form = DeactivateProfileForm(request.POST, instance=profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Profile has been deactivated.")
                logout(request)
                return redirect(reverse("index_view"))
        else:
            form = DeactivateProfileForm(instance=profile)

        return render(request, "people/profile_delete.html", {
            "form": form,
        })
    else:
        return HttpResponseForbidden(
            'You are not allowed to delete other users profile')


class LeaderListView(ListView):
    context_object_name = 'leaders'
    model = Leader


def debug_view(req, template):
    return render_to_response('testing/%s.html' % template, RequestContext(req))


def proxy(request):
    PROXY_ALLOWED_HOSTS = getattr(settings, 'PROXY_ALLOWED_HOSTS', ())
    hostname = (ogc_server_settings.hostname,) if ogc_server_settings else ()
    PROXY_ALLOWED_HOSTS += hostname

    if 'url' not in request.GET:
        return HttpResponse("The proxy service requires a URL-encoded URL as a parameter.",
                            status=400,
                            content_type="text/plain"
                            )

    raw_url = request.GET['url']
    url = urlsplit(raw_url)

    locator = url.path
    if url.query != "":
        locator += '?' + url.query
    if url.fragment != "":
        locator += '#' + url.fragment

    if not settings.DEBUG:
        if not validate_host(url.hostname, PROXY_ALLOWED_HOSTS):
            return HttpResponse("DEBUG is set to False but the host of the path provided "
                                "to the proxy service is not in the "
                                "PROXY_ALLOWED_HOSTS setting.",
                                status=403,
                                content_type="text/plain"
                                )
    headers = {}

    if settings.SESSION_COOKIE_NAME in request.COOKIES and is_safe_url(url=raw_url, host=ogc_server_settings.netloc):
        headers["Cookie"] = request.META["HTTP_COOKIE"]

    if request.META.get('HTTP_AUTHORIZATION'):
        headers['AUTHORIZATION'] = request.META.get('HTTP_AUTHORIZATION')

    if request.method in ("POST", "PUT") and "CONTENT_TYPE" in request.META:
        headers["Content-Type"] = request.META["CONTENT_TYPE"]

    if request.META.get('HTTP_ACCEPT'):
        headers['ACCEPT'] = request.META['HTTP_ACCEPT']

    if url.scheme == 'https':
        conn = HTTPSConnection(url.hostname, url.port)
    else:
        conn = HTTPConnection(url.hostname, url.port)

    conn.request(request.method, locator, request.body, headers)
    result = conn.getresponse()

    response = HttpResponse(result.read(),
                            status=result.status,
                            content_type=result.getheader("Content-Type", "text/plain"),
                            )

    if result.getheader('www-authenticate'):
        response['www-authenticate'] = "GeoNode"

    return response

@login_required
def new_map_json(request):

    if request.method == 'GET':
        map_obj, config = new_map_config(request)
        if isinstance(config, HttpResponse):
            return config
        else:
            return HttpResponse(config)

    elif request.method == 'POST':
        if not request.user.is_authenticated():
            return HttpResponse(
                'You must be logged in to save new maps',
                content_type="text/plain",
                status=401
            )

        map_obj = Map(owner=request.user, zoom=0,
                      center_x=0, center_y=0)
        map_obj.save()
        map_obj.set_default_permissions()
        map_obj.handle_moderated_uploads()
        # If the body has been read already, use an empty string.
        # See https://github.com/django/django/commit/58d555caf527d6f1bdfeab14527484e4cca68648
        # for a better exception to catch when we move to Django 1.7.
        try:
            body = request.body
        except Exception:
            body = ''

        try:
            map_obj.update_from_viewer(body)
            MapSnapshot.objects.create(
                config=clean_config(body),
                map=map_obj,
                user=request.user)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
        else:
            return HttpResponse(
                json.dumps({'id': map_obj.id}),
                status=200,
                content_type='application/json'
            )
    else:
        return HttpResponse(status=405)

@login_required
def mapstory_map_json(request, mapid, snapshot=None):
    if request.method =='PUT':
        map_obj = Map.objects.get(id=mapid)
        if not request.user.has_perm('change_resourcebase', map_obj.get_self_resource()):
            return HttpResponse(
                _PERMISSION_MSG_SAVE,
                status=401,
                content_type="text/plain"
            )

        config = json.loads(request.body)
        map_obj.layers_config = json.dumps(config['layers'])
        map_obj.save()

    return map_json(request, mapid, snapshot)

@xframe_options_exempt
def map_view(request, mapid, snapshot=None, layer_name=None,
             template='maps/map_view.html'):
    """
    The view that returns the map composer opened to
    the map with the given map ID.
    """
    # This is a MapStory specific change.
    map_obj = _resolve_story(request, mapid, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)
    # End MapStory Specific Change
    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        access_token = None

    if snapshot is None:
        config = map_obj.viewer_json(request.user, access_token)
    else:
        config = snapshot_config(snapshot, map_obj, request.user, access_token)

    if layer_name:
        config = add_layers_to_map_config(
            request, map_obj, (layer_name, ), False)

    return render(request, template, context={
        'config': json.dumps(config),
        'map': map_obj,
        'preview': getattr(
            settings,
            'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
            'geoext')
    })


def mapstory_view(request, slug, snapshot=None, template='composer_new/composer.html'):
    """
    The view that returns the map viewer opened to
    the mapstory with the given ID.
    """

    story_obj = _resolve_map(request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        access_token = None

    if snapshot is None:
        config = story_obj.viewer_json(request.user, access_token)
    else:
        config = snapshot_config(snapshot, story_obj, request.user)

    config['about']['detail_url'] = slug

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'composerMode': False,
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
    create_mapstory_thumbnail_tx_aware(story_obj,True)
    return HttpResponse("create story thumbnail task was scheduled for story id="+str(story_obj.id)+", with uuid="+str(story_obj.uuid))

def save_story(request, storyid):
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

    try:
        story_obj.update_from_viewer(request.body)
        return HttpResponse(json.dumps(story_obj.viewer_json(request.user)))
    except ValueError as e:
        return HttpResponse(
                "The server could not understand the request." + str(e),
                content_type="text/plain",
                status=400
        )


def new_story_json(request):
    if not request.user.is_authenticated():
        return HttpResponse(
                'You must be logged in to save new maps',
                content_type="text/plain",
                status=401
        )
    story_obj = MapStory(owner=request.user)
    story_obj.save()
    story_obj.set_default_permissions()

    # If the body has been read already, use an empty string.
    # See https://github.com/django/django/commit/58d555caf527d6f1bdfeab14527484e4cca68648
    # for a better exception to catch when we move to Django 1.7.
    try:
        body = request.body
    except Exception:
        body = ''

    try:
        story_obj.update_from_viewer(body)
    except ValueError as e:
        return HttpResponse(str(e), status=400)
    else:
        return HttpResponse(
                json.dumps({'id': story_obj.id}),
                status=200,
                content_type='application/json'
        )


def draft_view(request, slug, template='composer/maploom.html'):

    story_obj = _resolve_story(request, slug, 'base.change_resourcebase', _PERMISSION_MSG_SAVE)

    config = story_obj.viewer_json(request.user)



    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'story': story_obj
    }))


def composer_new_view(request, slug, template='composer_new/composer.html'):
    story_obj = _resolve_story(request, slug, 'base.change_resourcebase', _PERMISSION_MSG_SAVE)
    config = story_obj.viewer_json(request.user)
    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'story': story_obj
    }))


@login_required
def mapstory_draft(request, storyid, template):
    return draft_view(request, storyid, template)


@login_required
def new_map(request, template='maps/map_new.html'):
    map_obj, config = new_map_config(request)
    context_dict = {
        'config': config,
        'map': map_obj
    }
    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    if isinstance(config, HttpResponse):
        return config
    else:
        return render(
            request,
            template,
            context=context_dict)


@login_required
def layer_create(request, template='upload/layer_create.html'):
    if request.method == 'POST':
        errors = False
        error_messages = []

        if request.is_ajax():
            configuration_options = json.loads(request.body)
        else:
            configuration_options = request.POST
            if isinstance(configuration_options.get('featureType', {}), str) \
                    or isinstance(configuration_options.get('featureType', {}), unicode):
                configuration_options['featureType'] = json.loads(configuration_options['featureType'])

        if not configuration_options.get('layer_owner'):
            configuration_options['layer_owner'] = request.user

        if configuration_options['featureType'].get('editable') is True:
            configuration_options['storeCreateGeogig'] = True

        store_name = '{0}-layers'.format(request.user.username.lower())
        configuration_options['featureType']['store']['name'] = store_name

        # Launder the name of each attribute to ensure that there's no spaces or special characters,
        # as they will break the functionality of adding and editing features.
        for attribute in configuration_options['featureType']['attributes']['attribute']:
            attribute['name'] = launder(attribute['name'])

        creator = GeoServerLayerCreator()
        try:
            layers = creator.handle(configuration_options=configuration_options)

        except UploadError as e:
            errors = True
            error_messages.append((configuration_options['featureType']['name'], e.message))

        if request.is_ajax():
            if errors:
                return HttpResponse(json.dumps({'status': 'failure', 'errors': error_messages}), status=400,
                                    content_type='application/json')
            if layers:
                layer_names = map(lambda layer: {'name': layer.name, 'url': layer.get_absolute_url()},
                                  Layer.objects.filter(name__in=[n[0] for n in layers]))

                return HttpResponse(json.dumps({'status': 'success', 'layers': layer_names}), status=201,
                                    content_type='application/json')

    return render_to_response(template, RequestContext(request, {}))


def layer_append_minimal(source, target, request_cookies):
    """
    The main layer_append logic that can run outside of a request.
    """
    source = 'geonode:' + source

    def chunk_list(list, chunk_size):
        """Yield successive chunk_size chunks from list."""
        for i in xrange(0, len(list), chunk_size):
            yield list[i:i+chunk_size]

    # TODO: use the provided column to decide which features should be updated and which should be created
    # join_on_attribute = json.loads(request.POST.get(u'joinOnAttributeName', 'false'))

    get_features_request = requests.post(
            '{}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames={}'.format(ogc_server_settings.public_url,
                                                                                      source),
            auth=ogc_server_settings.credentials
    )

    if has_exception(get_features_request.content):
        raise AssertionError('Failed to get features from source layer: {0}'.format(source))

    # the response to getfeatures will look like the following. We want everything between first <wfs:member> and last </wfs:member>
    # <wfs:FeatureCollection ...>
    #     <wfs:member>
    #         <geonode:a3 gml:id="a3.4">
    #             <geonode:geometry>
    #                 <gml:Point srsDimension="2" srsName="urn:ogc:def:crs:EPSG::4326">
    #                     <gml:pos>14.101186235070415 -87.19960869178765</gml:pos>
    #                 </gml:Point>
    #             </geonode:geometry>
    #         </geonode:a3>
    #     </wfs:member>
    #     ...
    #     <wfs:member>
    #         ...
    #     </wfs:member>
    # </wfs:FeatureCollection>

    # Create the xml containing all the features that need to be posted. Need to get the features form the source
    # layer, update them so that they get posted to the destination layer
    xml = etree.XML(get_features_request.content)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    for ns in root.nsmap:
        xpath_ns = etree.FunctionNamespace(root.nsmap[ns])
        xpath_ns.prefix = ns
    members = tree.xpath('//wfs:FeatureCollection/wfs:member')
    members_str = []
    for m in members:
        # replace the tag <workspace>:<layer_destination> with <workspace>:<layer_source>
        tokens = target.split(':')
        layername_element = m.find(source, root.nsmap)
        layername_element.tag = '{' + root.nsmap[tokens[0]] + '}' + tokens[1]
        members_str.append(etree.tostring(m))

    # divide the features (members_str) into chunks so that we can have a progress indicator
    features_per_chunk = 750
    features_chunks = chunk_list(members_str, features_per_chunk)

    # example of transactions can be found at:
    # https://github.com/highsource/ogc-schemas/tree/2.0.0/schemas/src/main/resources/ogc/wfs/2.0/examples
    wfst_insert_template = ' '.join((
        '<?xml version="1.0" encoding="utf-8"?>',
        '<wfs:Transaction',
        'service="WFS"',
        'version="2.0.0"',
        'xmlns:{workspace}="{workspace_uri}"',
        'xmlns:gml="http://www.opengis.net/gml/3.2"',
        'xmlns:wfs="http://www.opengis.net/wfs/2.0"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'handle="{handle}"',
        'xsi:schemaLocation="',
        'http://www.opengis.net/wfs/2.0',
        'http://schemas.opengis.net/wfs/2.0/wfs.xsd',
        'http://www.opengis.net/gml/3.2',
        'http://schemas.opengis.net/gml/3.2.1/gml.xsd">',
        '<wfs:Insert>',
        '{features}',
        '</wfs:Insert>',
        '</wfs:Transaction>'
    ))

    summary_aggregate = []
    summary = None
    for features in features_chunks:
        handle = 'added {0} features to {1} via append'.format(len(features), target)
        wfs_transaction_payload = wfst_insert_template.format(features=''.join(features), workspace='geonode',
                                                              workspace_uri='http://www.geonode.org/', handle=handle)
        insert_features_request = requests.post(
            '{}/wfs/WfsDispatcher'.format(ogc_server_settings.public_url),
            cookies=request_cookies,
            headers={'Content-Type': 'application/xml'},
            data=wfs_transaction_payload
        )

        if has_exception(insert_features_request.content) is False:
            print_exception(insert_features_request.content)
        else:
            summary = parse_wfst_response(insert_features_request.content)
            summary_aggregate.append(summary)

    return summary_aggregate


def download_append_csv(request):

    # Retrieve the CSV and save it in a variable
    csv_url = request.session['csv_link'].lower()
    csv_name = '{}.csv'.format(request.session['csv_name'])
    original_csv = pandas.read_csv(csv_url)
    fieldnames = [fieldname.lower() for fieldname in original_csv.columns.values.tolist()]

    # Remove the FID and OGC_FID fields
    if 'fid' in fieldnames:
        fieldnames.remove('fid')
    if 'ogc_fid' in fieldnames:
        fieldnames.remove('ogc_fid')
    # Create the new CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename={}'.format(csv_name)
    writer = csv.writer(response)
    writer.writerow(fieldnames)

    # Return the CSV as an HTTP Response for the user to download
    return response


@contextlib.contextmanager
def temporary_directory(*args, **kwargs):
    """
    A context manager that allows us to create a temporary directory
    that will be cleaned up after it's no longer being used.
    """
    tempdir = tempfile.mkdtemp(*args, **kwargs)
    try:
        yield tempdir
    finally:
        shutil.rmtree(tempdir)


def download_append_shp(request):
    """
    This function grabs a zipped shapefile from a WFS request, and removes
    the fields that are unnecessary for appending data to that layer.
    """

    # Create a temporary directory that is removed after the user downloads the zipfile.
    with temporary_directory() as tempdir:

        shp_url = request.session['shp_link'].lower()
        shp_name = '{}.zip'.format(request.session['shp_name'])

        # Download the zip file to a temporary directory.
        shapefile_request = requests.get(shp_url)
        with open(os.path.join(tempdir, shp_name), "wb") as code:
            code.write(shapefile_request.content)

        # Extract the zip file to a temporary directory.
        original_zipfile = zipfile.ZipFile("{}/{}".format(tempdir, shp_name))
        original_zipfile.extractall(tempdir)

        # Remove the zip file after we've extracted it.
        os.remove("{}/{}".format(tempdir, shp_name))

        # Find the shapefile (.shp) and set it's name to a variable for later use.
        for root, dirs, files in os.walk(tempdir):
            for file in files:
                if file.endswith(".shp"):
                    shapefile_name = file
                    table_name = shapefile_name.rsplit('.', 1)[0]
                    break

        # Read the shapefile and it's attributes.
        data_source = ogr.Open(os.path.join(tempdir, shapefile_name), True)
        data_layer = data_source.GetLayer(0)
        layer_definition = data_layer.GetLayerDefn()
        field_list = []

        for i in range(layer_definition.GetFieldCount()):
            field_list.append(layer_definition.GetFieldDefn(i).GetName().lower())

        # Remove the FID and OGC_FID attributes
        if 'ogc_fid' in field_list:
            data_source.ExecuteSQL('ALTER TABLE {} DROP COLUMN ogc_fid'.format(table_name))
        if 'fid' in field_list:
            data_source.ExecuteSQL('ALTER TABLE {} DROP COLUMN fid'.format(table_name))

        # Open StringIO to grab in-memory ZIP contents and write the new zipfile.
        in_memory_contents = StringIO.StringIO()

        new_zipfile = zipfile.ZipFile(in_memory_contents, "w", compression=zipfile.ZIP_DEFLATED)
        for dirname, subdirs, files in os.walk(tempdir):
            for filename in files:
                new_zipfile.write(os.path.join(dirname, filename), os.path.basename(filename))
        new_zipfile.close()

        # Grab ZIP file from in-memory, make response with correct MIME-type
        response = HttpResponse(in_memory_contents.getvalue(), content_type="application/zip")
        # ..and correct content-disposition.
        response['Content-Disposition'] = 'attachment; filename=%s' % shp_name

        # Return the HttpResponse (zipfile) to the user for download.
        return response


def layer_detail(request, layername, template='layers/layer_detail.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.view_resourcebase',
        _PERMISSION_MSG_VIEW)


    # assert False, str(layer_bbox)
    config = layer.attribute_config()

    # Add required parameters for GXP lazy-loading
    layer_bbox = layer.bbox[0:4]
    bbox = layer_bbox[:]
    bbox[0] = float(layer_bbox[0])
    bbox[1] = float(layer_bbox[2])
    bbox[2] = float(layer_bbox[1])
    bbox[3] = float(layer_bbox[3])

    def decimal_encode(bbox):
        import decimal
        _bbox = []
        for o in [float(coord) for coord in bbox]:
            if isinstance(o, decimal.Decimal):
                o = (str(o) for o in [o])
            _bbox.append(o)
        return _bbox

    def sld_definition(style):
        from urllib import quote
        _sld = {
            "title": style.sld_title or style.name,
            "legend": {
                "height": "40",
                "width": "22",
                "href": layer.ows_url +
                "?service=wms&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" +
                quote(layer.service_typename, safe=''),
                "format": "image/png"
            },
            "name": style.name
        }
        return _sld

    if hasattr(layer, 'srid'):
        config['crs'] = {
            'type': 'name',
            'properties': layer.srid
        }
    # Add required parameters for GXP lazy-loading
    attribution = "%s %s" % (layer.owner.first_name,
                             layer.owner.last_name) if layer.owner.first_name or layer.owner.last_name else str(
        layer.owner)
    srs = getattr(settings, 'DEFAULT_MAP_CRS', 'EPSG:3857')
    config["attribution"] = "<span class='gx-attribution-title'>%s</span>" % attribution
    config["format"] = getattr(
        settings, 'DEFAULT_LAYER_FORMAT', 'image/png')
    config["title"] = layer.title
    config["wrapDateLine"] = True
    config["visibility"] = True
    config["srs"] = srs
    config["bbox"] = decimal_encode(
        bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                           target_srid=int(srs.split(":")[1]))[:4])
    config["capability"] = {
        "abstract": layer.abstract,
        "name": layer.alternate,
        "title": layer.title,
        "queryable": True,
        "bbox": {
            layer.srid: {
                "srs": layer.srid,
                "bbox": decimal_encode(bbox)
            },
            srs: {
                "srs": srs,
                "bbox": decimal_encode(
                    bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                                       target_srid=int(srs.split(":")[1]))[:4])
            },
            "EPSG:4326": {
                "srs": "EPSG:4326",
                "bbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
                decimal_encode(bbox_to_projection(
                    [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
            }
        },
        "srs": {
            srs: True
        },
        "formats": ["image/png", "application/atom xml", "application/atom+xml", "application/json;type=utfgrid",
                    "application/openlayers", "application/pdf", "application/rss xml", "application/rss+xml",
                    "application/vnd.google-earth.kml", "application/vnd.google-earth.kml xml",
                    "application/vnd.google-earth.kml+xml", "application/vnd.google-earth.kml+xml;mode=networklink",
                    "application/vnd.google-earth.kmz", "application/vnd.google-earth.kmz xml",
                    "application/vnd.google-earth.kmz+xml", "application/vnd.google-earth.kmz;mode=networklink",
                    "atom", "image/geotiff", "image/geotiff8", "image/gif", "image/gif;subtype=animated",
                    "image/jpeg", "image/png8", "image/png; mode=8bit", "image/svg", "image/svg xml",
                    "image/svg+xml", "image/tiff", "image/tiff8", "image/vnd.jpeg-png",
                    "kml", "kmz", "openlayers", "rss", "text/html; subtype=openlayers", "utfgrid"],
        "attribution": {
            "title": attribution
        },
        "infoFormats": ["text/plain", "application/vnd.ogc.gml", "text/xml", "application/vnd.ogc.gml/3.1.1",
                        "text/xml; subtype=gml/3.1.1", "text/html", "application/json"],
        "styles": [sld_definition(s) for s in layer.styles.all()],
        "prefix": layer.alternate.split(":")[0] if ":" in layer.alternate else "",
        "keywords": [k.name for k in layer.keywords.all()] if layer.keywords else [],
        "llbbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
        decimal_encode(bbox_to_projection(
            [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
    }

    if layer.storeType == "remoteStore":
        service = layer.remote_service
        source_params = {
            "ptype": service.ptype,
            "remote": True,
            "url": service.service_url,
            "name": service.name,
            "title": "[R] %s" % service.title}
        maplayer = GXPLayer(
            name=layer.alternate,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config),
            source_params=json.dumps(source_params))
    else:
        maplayer = GXPLayer(
            name=layer.alternate,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config))

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    layer.view_count_up(request.user)

    # center/zoom don't matter; the viewer will center on the layer bounds
    map_obj = GXPMap(
        projection=getattr(
            settings,
            'DEFAULT_MAP_CRS',
            'EPSG:900913'))

    NON_WMS_BASE_LAYERS = [
        la for la in default_map_config(request)[1] if la.ows_url is None]

    metadata = layer.link_set.metadata().filter(
        name__in=settings.DOWNLOAD_FORMATS_METADATA)

    granules = None
    all_granules = None
    all_times = None
    filter = None
    if layer.is_mosaic:
        try:
            cat = gs_catalog
            cat._cache.clear()
            store = cat.get_store(layer.name)
            coverages = cat.mosaic_coverages(store)

            filter = None
            try:
                if request.GET["filter"]:
                    filter = request.GET["filter"]
            except BaseException:
                pass

            offset = 10 * (request.page - 1)
            granules = cat.mosaic_granules(
                coverages['coverages']['coverage'][0]['name'],
                store,
                limit=10,
                offset=offset,
                filter=filter)
            all_granules = cat.mosaic_granules(
                coverages['coverages']['coverage'][0]['name'], store, filter=filter)
        except BaseException:
            granules = {"features": []}
            all_granules = {"features": []}
    if check_ogc_backend(geoserver.BACKEND_PACKAGE):
        from geonode.geoserver.views import get_capabilities
        if layer.has_time:
            workspace, layername = layer.alternate.split(
                ":") if ":" in layer.alternate else (None, layer.alternate)
            # WARNING Please make sure to have enabled DJANGO CACHE as per
            # https://docs.djangoproject.com/en/2.0/topics/cache/#filesystem-caching
            wms_capabilities_resp = get_capabilities(
                request, layer.id, tolerant=True)
            if wms_capabilities_resp.status_code >= 200 and wms_capabilities_resp.status_code < 400:
                wms_capabilities = wms_capabilities_resp.getvalue()
                if wms_capabilities:
                    import xml.etree.ElementTree as ET
                    e = ET.fromstring(wms_capabilities)
                    for atype in e.findall(
                            "Capability/Layer/Layer[Name='%s']/Extent" % (layername)):
                        dim_name = atype.get('name')
                        if dim_name:
                            dim_name = str(dim_name).lower()
                            if dim_name == 'time':
                                dim_values = atype.text
                                if dim_values:
                                    all_times = dim_values.split(",")
                                    break

    group = None
    if layer.group:
        try:
            group = GroupProfile.objects.get(slug=layer.group.name)
        except GroupProfile.DoesNotExist:
            group = None
    # a flag to be used for qgis server
    show_popup = False
    if 'show_popup' in request.GET and request.GET["show_popup"]:
        show_popup = True

    ###
    # MapStory Specific Changes
    ###
    keywords = json.dumps([tag.name for tag in layer.keywords.all()])

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=layer)
        metadata_form = MetadataForm(instance=layer)
        distributionurl_form = DistributionUrlForm(request.POST, instance=layer)
        if 'keywords' in request.POST:
            if keywords_form.is_valid():
                keywords_form.save()
                new_keywords = keywords_form.cleaned_data['keywords']
                layer.keywords.set(*new_keywords)
                layer.save()
            metadata_form = MetadataForm(instance=layer)
        elif 'title' in request.POST:
            metadata_form = MetadataForm(request.POST, instance=layer)
            if metadata_form.is_valid():
                metadata_form.save()
                # update all the metadata
                if metadata_form.cleaned_data['category'] is not None:
                    new_category = TopicCategory.objects.get(id=metadata_form.cleaned_data['category'].id)
                    Layer.objects.filter(id=layer.id).update(category=new_category)
                layer.title = metadata_form.cleaned_data['title']
                layer.language = metadata_form.cleaned_data['language']
                layer.data_quality_statement = metadata_form.cleaned_data['data_quality_statement']
                layer.purpose = metadata_form.cleaned_data['purpose']
                layer.is_published = metadata_form.cleaned_data['is_published']
                layer.save()
        if distributionurl_form.is_valid():
            layer.distribution_url = distributionurl_form.cleaned_data['distribution_url']

            keywords_form = KeywordsForm(instance=layer)
        if 'add_keyword' in request.POST:
            layer.keywords.add(request.POST['add_keyword'])
            layer.save()
        if 'remove_keyword' in request.POST:
            layer.keywords.remove(request.POST['remove_keyword'])
            layer.save()
    else:
        keywords_form = KeywordsForm(instance=layer)
        metadata_form = MetadataForm(instance=layer)
        distributionurl_form = DistributionUrlForm(instance=layer)

    content_moderators = Group.objects.filter(name='content_moderator').first()

    thumbnail = layer.get_thumbnail_url

    # This will get URL encoded later and is used for the social media share URL
    share_url = "https://%s/layers/%s" % (request.get_host(), layer.typename)
    share_title = "%s by %s." % (layer.title, layer.owner)
    share_description = layer.abstract

    # Get membership buttons ready:
    admin_memberships = []
    # Check if user is admin in one of those organizations
    users_org_memberships = OrganizationMembership.objects.filter(user_id=request.user.pk)
    for membership in users_org_memberships.all():
        # We have permission if we own the layer, or if we are an organization's admin.
        if (layer.owner == request.user) or membership.is_admin:
            admin_memberships.append(membership)

    if len(admin_memberships) < 1:
        admin_memberships = None

    ini_memberships = []
    # Checks if user is admin for Inititives
    user_ini_memberships = InitiativeMembership.objects.filter(user_id=request.user.pk)
    for membership in user_ini_memberships.all():
        if(layer.owner == request.user) or membership.is_admin:
            ini_memberships.append(membership)

    if len(ini_memberships) < 1:
        ini_memberships = None

    shapefile_link = layer.link_set.download().filter(mime='SHAPE-ZIP').first()
    if shapefile_link is not None:
        shapefile_link = shapefile_link.url + '&featureID=fakeID' + '&maxFeatures=1'
        request.session['shp_name'] = layer.typename
        request.session['shp_link'] = shapefile_link

    csv_link = layer.link_set.download().filter(mime='csv').first()
    if csv_link is not None:
        csv_link = csv_link.url + '&featureID=fakeID' + '&maxFeatures=1'
        request.session['csv_name'] = layer.typename
        request.session['csv_link'] = csv_link

    ###
    # End MapStory Specific Changes 
    ###

    context_dict = {
        'resource': layer,
        'group': group,
        'perms_list': get_perms(request.user, layer.get_self_resource()),
        "permissions_json": _perms_info_json(layer),
        "documents": get_related_documents(layer),
        "metadata": metadata,
        "is_layer": True,
        "wps_enabled": settings.OGC_SERVER['default']['WPS_ENABLED'],
        "granules": granules,
        "all_granules": all_granules,
        "all_times": all_times,
        "show_popup": show_popup,
        "filter": filter,
        "storeType": layer.storeType,
        "online": (layer.remote_service.probe == 200) if layer.storeType == "remoteStore" else True,
        # MapStory Specific Additions
        "keywords": keywords,
        "keywords_form": keywords_form,
        "metadata_form": metadata_form,
        "distributionurl_form": distributionurl_form,
        "content_moderators": content_moderators,
        "thumbnail": thumbnail,
        "share_url": share_url,
        "share_title": share_title,
        "share_description": share_description,
        "organizations":admin_memberships,
        "initiatives": ini_memberships
    }

    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        u = uuid.uuid1()
        access_token = u.hex

    context_dict["viewer"] = json.dumps(map_obj.viewer_json(
        request.user, access_token, * (NON_WMS_BASE_LAYERS + [maplayer])))
    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    context_dict["crs"] = getattr(
        settings,
        'DEFAULT_MAP_CRS',
        'EPSG:900913')

    # provide bbox in EPSG:4326 for leaflet
    if context_dict["preview"] == 'leaflet':
        srid, wkt = layer.geographic_bounding_box.split(';')
        srid = re.findall(r'\d+', srid)
        geom = GEOSGeometry(wkt, srid=int(srid[0]))
        geom.transform(4326)
        context_dict["layer_bbox"] = ','.join([str(c) for c in geom.extent])

    if layer.storeType == 'dataStore':
        links = layer.link_set.download().filter(
            name__in=settings.DOWNLOAD_FORMATS_VECTOR)
    else:
        links = layer.link_set.download().filter(
            name__in=settings.DOWNLOAD_FORMATS_RASTER)
    links_view = [item for idx, item in enumerate(links) if
                  item.url and 'wms' in item.url or 'gwc' in item.url]
    links_download = [item for idx, item in enumerate(
        links) if item.url and 'wms' not in item.url and 'gwc' not in item.url]
    for item in links_view:
        if item.url and access_token and 'access_token' not in item.url:
            params = {'access_token': access_token}
            item.url = Request('GET', item.url, params=params).prepare().url
    for item in links_download:
        if item.url and access_token and 'access_token' not in item.url:
            params = {'access_token': access_token}
            item.url = Request('GET', item.url, params=params).prepare().url

    if request.user.has_perm('view_resourcebase', layer.get_self_resource()):
        context_dict["links"] = links_view
    if request.user.has_perm(
        'download_resourcebase',
            layer.get_self_resource()):
        if layer.storeType == 'dataStore':
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_VECTOR)
        else:
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_RASTER)
        context_dict["links_download"] = links_download

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, layer)
    layers_names = layer.alternate
    try:
        if settings.DEFAULT_WORKSPACE and settings.DEFAULT_WORKSPACE in layers_names:
            workspace, name = layers_names.split(':', 1)
        else:
            name = layers_names
    except BaseException:
        logger.error("Can not identify workspace type and layername")

    context_dict["layer_name"] = json.dumps(layers_names)

    try:
        # get type of layer (raster or vector)
        if layer.storeType == 'coverageStore':
            context_dict["layer_type"] = "raster"
        elif layer.storeType == 'dataStore':
            if layer.has_time:
                context_dict["layer_type"] = "vector_time"
            else:
                context_dict["layer_type"] = "vector"

            location = "{location}{service}".format(** {
                'location': settings.OGC_SERVER['default']['LOCATION'],
                'service': 'wms',
            })
            # get schema for specific layer
            username = settings.OGC_SERVER['default']['USER']
            password = settings.OGC_SERVER['default']['PASSWORD']
            schema = get_schema(
                location,
                name,
                username=username,
                password=password)

            # get the name of the column which holds the geometry
            if 'the_geom' in schema['properties']:
                schema['properties'].pop('the_geom', None)
            elif 'geom' in schema['properties']:
                schema['properties'].pop("geom", None)

            # filter the schema dict based on the values of layers_attributes
            layer_attributes_schema = []
            for key in schema['properties'].keys():
                layer_attributes_schema.append(key)

            filtered_attributes = layer_attributes_schema
            context_dict["schema"] = schema
            context_dict["filtered_attributes"] = filtered_attributes

    except BaseException:
        logger.error(
            "Possible error with OWSLib. Turning all available properties to string")

    # maps owned by user needed to fill the "add to existing map section" in
    # template
    if request.user.is_authenticated():
        context_dict["maps"] = Map.objects.filter(owner=request.user)
    return TemplateResponse(
        request, template, context=context_dict)

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
    map_obj = _resolve_map(request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

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
        config = map_obj.viewer_json(request.user, access_token)
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
    org_stories = OrganizationMapStory.objects.filter(mapstory=map_obj)
    org_admin_memberships = []
    memberships = OrganizationMembership.objects.filter(user_id=request.user.pk)
    for membership in memberships.all():
        if membership.is_admin:
            org_admin_memberships.append(membership)

    if len(org_admin_memberships) < 1:
        org_admin_memberships = None

    ini_memberships = InitiativeMembership.objects.filter(user_id=request.user.pk)
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
        context_dict["favorite_info"] = get_favorite_info(request.user, map_obj)

    return render(request, template, context=context_dict)


@login_required
def layer_remove(request, layername, template='layers/layer_remove.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.delete_resourcebase',
        _PERMISSION_MSG_DELETE)

    if (request.method == 'GET'):
        return render_to_response(template, RequestContext(request, {
            "layer": layer
        }))
    if (request.method == 'POST'):
        try:
            delete_layer(object_id=layer.id)
        except Exception as e:
            message = '{0}: {1}.'.format(_('Unable to delete layer'), layer.typename)

            if 'referenced by layer group' in getattr(e, 'message', ''):
                message = _('This layer is a member of a layer group, you must remove the layer from the group '
                            'before deleting.')

            messages.error(request, message)
            return render_to_response(template, RequestContext(request, {"layer": layer}))
        return HttpResponseRedirect(reverse("profile_detail", kwargs={'slug': layer.owner}))
    else:
        return HttpResponse("Not allowed", status=403)


@login_required
def map_remove(request, mapid, template='maps/map_remove.html'):
    ''' Delete a map, and its constituent layers. '''
    map_obj = _resolve_map(request, mapid, 'base.delete_resourcebase', _PERMISSION_MSG_VIEW)

    if request.method == 'GET':
        return render_to_response(template, RequestContext(request, {
            "map": map_obj
        }))

    elif request.method == 'POST':
        delete_mapstory(object_id=map_obj.id)
        return HttpResponseRedirect(reverse("profile_detail", kwargs={'slug': map_obj.owner}))


def layer_detail_id(request, layerid):
    layer = get_object_or_404(Layer, pk=layerid)
    return layer_detail(request, layer.typename)


def layer_acls_mapstory(request):
    response = layer_acls(request)
    result = json.loads(response.content)
    result["fullname"] = request.user.username

    return HttpResponse(json.dumps(result), content_type="application/json")


def resolve_user_mapstory(request):
    response = resolve_user(request)
    result = json.loads(response.content)
    result["fullname"] = request.user.username

    return HttpResponse(json.dumps(result), content_type="application/json")


def new_map_config(request):
    '''
    View that creates a new map.

    If the query argument 'copy' is given, the initial map is
    a copy of the map with the id specified, otherwise the
    default map configuration is used.  If copy is specified
    and the map specified does not exist a 404 is returned.
    '''
    DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config(request)

    if 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        access_token = None

    map_obj = None
    if request.method == 'GET' and 'copy' in request.GET:
        mapid = request.GET['copy']
        map_obj = _resolve_map(request, mapid, 'base.view_resourcebase')

        map_obj.abstract = DEFAULT_ABSTRACT
        map_obj.title = DEFAULT_TITLE
        if request.user.is_authenticated():
            map_obj.owner = request.user

        config = map_obj.viewer_json(request.user, access_token)
        map_obj.handle_moderated_uploads()
        del config['id']
    else:
        if request.method == 'GET':
            params = request.GET
        elif request.method == 'POST':
            params = request.POST
        else:
            return HttpResponse(status=405)

        if 'layer' in params:
            map_obj = Map(projection=getattr(settings, 'DEFAULT_MAP_CRS',
                                             'EPSG:900913'))
            config = add_layers_to_map_config(
                request, map_obj, params.getlist('layer'))
        else:
            config = DEFAULT_MAP_CONFIG
    return map_obj, json.dumps(config)

def get_remote_url(request, layername):
    layer = _resolve_layer(
        request,
        layername,
        'base.view_resourcebase',
        _PERMISSION_MSG_DELETE)

    url = None

    if layer.remote_service is not None:
        service = layer.remote_service
        url = service.online_resource

    return HttpResponse(url)
