import contextlib
import csv
import datetime
from httplib import HTTPConnection, HTTPSConnection
import json
import math
import ogr
import os
import pandas
import shutil
import StringIO
import tempfile
from urlparse import urlsplit
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
from django.utils.http import is_safe_url
from django.utils.timezone import now as provider_now
from django.utils.translation import ugettext as _
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView

import requests
from account.conf import settings as account_settings
from account.views import ConfirmEmailView
from account.views import SignupView
from actstream.models import actor_stream
from geonode.base.models import TopicCategory, Region
from geonode.documents.models import get_related_documents
from geonode.geoserver.helpers import ogc_server_settings
from geonode.layers.models import Layer
from geonode.layers.views import _PERMISSION_MSG_GENERIC, _PERMISSION_MSG_VIEW, _PERMISSION_MSG_DELETE
from geonode.geoserver.views import layer_acls, resolve_user
from geonode.layers.views import _resolve_layer
from geonode.maps.views import snapshot_config, _PERMISSION_MSG_SAVE, _PERMISSION_MSG_LOGIN
from geonode.maps.models import MapLayer, MapSnapshot
from geonode.people.models import Profile
from geonode.security.views import _perms_info_json
from geonode.tasks.deletion import delete_layer
from geonode.utils import GXPLayer, GXPMap, resolve_object
from geonode.utils import build_social_links
from geonode.utils import default_map_config
from geonode.utils import forward_mercator, llbbox_to_mercator
from geonode.utils import DEFAULT_TITLE
from geonode.utils import DEFAULT_ABSTRACT
from health_check.plugins import plugin_dir
from icon_commons.models import Icon
from lxml import etree
from notification.models import NoticeSetting, NoticeType, NOTICE_MEDIA
from osgeo_importer.utils import UploadError, launder
from osgeo_importer.forms import UploadFileForm
from provider.oauth2.models import AccessToken
from user_messages.models import Thread

from apps.journal.models import JournalEntry
from mapstory.apps.health_check_geoserver.plugin_health_check import GeoServerHealthCheck
from mapstory.apps.favorite.models import Favorite
from mapstory.apps.thumbnails.models import ThumbnailImage, ThumbnailImageForm
from mapstory.apps.initiatives.models import InitiativeMembership, InitiativeLayer, InitiativeMapStory
from mapstory.apps.organizations.models import OrganizationMembership, OrganizationLayer, OrganizationMapStory
from mapstory.forms import DeactivateProfileForm, EditMapstoryProfileForm, EditGeonodeProfileForm
from mapstory.forms import KeywordsForm, MetadataForm, PublishStatusForm, DistributionUrlForm
from mapstory.forms import SignupForm
from mapstory.importers import GeoServerLayerCreator
from mapstory.mapstories.models import MapStory, Map
from mapstory.models import GetPage
from mapstory.models import Leader
from mapstory.models import NewsItem
from mapstory.models import get_sponsors, get_images
from mapstory.search.utils import update_es_index
from mapstory.utils import DEFAULT_VIEWER_PLAYBACKMODE
from mapstory.utils import has_exception, parse_wfst_response, print_exception
from .notifications import PROFILE_NOTICE_SETTINGS
from tasks import delete_mapstory


plugin_dir.register(GeoServerHealthCheck)


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


class MapStorySignupView(SignupView):

    form_class = SignupForm

    def after_signup(self, form):
        self.create_profile(form)
        super(MapStorySignupView, self).after_signup(form)

    def form_valid(self, form):
        # ensure all new accounts are lowercase
        form.cleaned_data["username"] = form.cleaned_data["username"].lower()
        super(MapStorySignupView, self).form_valid(form)
        return redirect(self.get_success_url())

    def create_profile(self, form):
        profile = self.created_user
        profile.first_name = form.cleaned_data["first_name"]
        profile.last_name = form.cleaned_data["last_name"]
        profile.save()


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
        ctx['threads_all'] = Thread.ordered(Thread.objects.inbox(self.object))
        ctx['threads_unread'] = Thread.ordered(Thread.objects.unread(self.object))
        ctx['action_list'] = actor_stream(ctx['profile'])
        # need to render the form
        ctx['form'] = UploadFileForm()
        notice_settings = []
        for notice in NoticeType.objects.filter(label__in=PROFILE_NOTICE_SETTINGS):
            notice_settings.append(NoticeSetting.for_user(self.object, notice, NOTICE_MEDIA[0][0]))
        ctx['notice_settings'] = notice_settings
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


class MapStoryConfirmEmailView(ConfirmEmailView):
    """
    Extends the ConfirmEmailView to send the welcome email.
    """

    # Override the post message to include the context data.
    def post(self, *args, **kwargs):
        self.object = confirmation = self.get_object()
        confirmation.confirm()
        ctx = self.get_context_data()
        self.after_confirmation(confirmation, ctx)
        redirect_url = self.get_redirect_url()
        if not redirect_url:
            ctx = self.get_context_data()
            return self.render_to_response(ctx)
        if self.messages.get("email_confirmed"):
            messages.add_message(
                self.request,
                self.messages["email_confirmed"]["level"],
                self.messages["email_confirmed"]["text"].format(**{
                    "email": confirmation.email_address.email
                })
            )
        return redirect(redirect_url)

    def after_confirmation(self, confirmation, ctx):
        """
        Send the welcome email.
        """
        subject = render_to_string("account/email/welcome_subject.txt")
        html_content = render_to_string("account/email/welcome_message.html", ctx)
        text_content = render_to_string("account/email/welcome_message.txt", ctx)
        msg = EmailMultiAlternatives(subject, text_content,
                                     account_settings.DEFAULT_FROM_EMAIL, [confirmation.email_address.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        super(MapStoryConfirmEmailView, self).after_confirmation(confirmation)


@login_required
def new_map_json(request):
    if request.method == 'GET':
        config = new_map_config(request)
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


@xframe_options_exempt
def map_view(request, mapid, snapshot=None, template='maps/map_view.html'):
    """
    The view that returns the map composer opened to
    the map with the given map ID.
    """
    map_obj = _resolve_story(request, mapid, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    if snapshot is None:
        config = map_obj.viewer_json(request.user)
    else:
        config = snapshot_config(snapshot, map_obj, request.user)

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config),
        'map': map_obj
    }))


def mapstory_view(request, slug, snapshot=None, template='viewer/story_viewer.html'):
    """
    The view that returns the map viewer opened to
    the mapstory with the given ID.
    """

    story_obj = _resolve_map(request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    if snapshot is None:
        config = story_obj.viewer_json(request.user)
    else:
        config = snapshot_config(snapshot, story_obj, request.user)

    config['about']['detail_url'] = slug

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config)
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
def new_map(request, template):
    config = new_map_config(request)
    if isinstance(config, HttpResponse):
        return config
    else:
        return render_to_response(template, RequestContext(request, {
            'config': config,
        }))


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

    # only owners and admins can view unpublished layers
    if not layer.is_published:
        if request.user != layer.owner and not request.user.is_superuser:
            return HttpResponse(_PERMISSION_MSG_VIEW, status=403, content_type="text/plain")

    if layer.storeType == "remoteStore":
        service = layer.service
        source_params = {
            "ptype": service.ptype,
            "remote": True,
            "url": service.base_url,
            "name": service.name}
        maplayer = GXPLayer(
            name=layer.typename,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config),
            source_params=json.dumps(source_params))
    else:
        maplayer = GXPLayer(
            name=layer.name,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config))

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    if request.user != layer.owner and not request.user.is_superuser:
        Layer.objects.filter(
            id=layer.id).update(popular_count=F('popular_count') + 1)

    # center/zoom don't matter; the viewer will center on the layer bounds
    map_obj = GXPMap(projection="EPSG:900913")
    NON_WMS_BASE_LAYERS = [
        la for la in default_map_config(None)[1] if la.ows_url is None]

    metadata = layer.link_set.metadata().filter(
        name__in=settings.DOWNLOAD_FORMATS_METADATA)

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

    thumbnail_dir = os.path.join(settings.MEDIA_ROOT, 'thumbs')
    default_thumbnail_array = layer.get_thumbnail_url().split('/')
    default_thumbnail_name = default_thumbnail_array[
        len(default_thumbnail_array) - 1
    ]
    default_thumbnail = os.path.join(thumbnail_dir, default_thumbnail_name)

    if request.method == 'POST':
        thumb_form = ThumbnailImageForm(request.POST, request.FILES)
        if thumb_form.is_valid():
            new_img = ThumbnailImage(
                thumbnail_image=request.FILES['thumbnail_image']
            )
            new_img.save()
            user_upload_thumbnail = ThumbnailImage.objects.all()[0]
            user_upload_thumbnail_filepath = str(
                user_upload_thumbnail.thumbnail_image
            )

            # only create backup for original thumbnail
            if os.path.isfile(default_thumbnail + '.bak') is False:
                os.rename(default_thumbnail, default_thumbnail + '.bak')

            os.rename(user_upload_thumbnail_filepath, default_thumbnail)

    else:
        thumb_form = ThumbnailImageForm()

    thumbnail = layer.get_thumbnail_url

    # This will get URL encoded later and is used for the social media share URL
    share_url = "https://%s/layers/%s" % (request.get_host(), layer.name)
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

    context_dict = {
        "resource": layer,
        "permissions_json": _perms_info_json(layer),
        "documents": get_related_documents(layer),
        "metadata": metadata,
        "keywords": keywords,
        "is_layer": True,
        "wps_enabled": settings.OGC_SERVER['default']['WPS_ENABLED'],
        "keywords_form": keywords_form,
        "metadata_form": metadata_form,
        "distributionurl_form": distributionurl_form,
        "content_moderators": content_moderators,
        "thumbnail": thumbnail,
        "thumb_form": thumb_form,
        "share_url": share_url,
        "share_title": share_title,
        "share_description": share_description,
        "organizations":admin_memberships,
        "initiatives": ini_memberships
    }

    context_dict["viewer"] = json.dumps(
        map_obj.viewer_json(
            request.user,
            * (NON_WMS_BASE_LAYERS + [maplayer])))
    context_dict["preview"] = getattr(
        settings,
        'LAYER_PREVIEW_LIBRARY')

    if request.user.has_perm('download_resourcebase', layer.get_self_resource()):
        if layer.storeType == 'dataStore':
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_VECTOR)
        else:
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_RASTER)
        context_dict["links"] = links

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

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, layer)

    return render_to_response(template, RequestContext(request, context_dict))


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

    map_obj = _resolve_map(request, slug, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    if request.user != map_obj.owner and not request.user.is_superuser:
        MapStory.objects.filter(id=map_obj.id).update(popular_count=F('popular_count') + 1)

    if snapshot is None:
        config = map_obj.viewer_json(request.user)
    else:
        config = snapshot_config(snapshot, map_obj, request.user)

    config = json.dumps(config)
    chapters = map_obj.chapters
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

    map_thumbnail_dir = os.path.join(settings.MEDIA_ROOT, 'thumbs')
    map_default_thumbnail_array = map_obj.get_thumbnail_url().split('/')
    map_default_thumbnail_name = 'map' + str(slug) + '.jpg'
    map_default_thumbnail = os.path.join(map_thumbnail_dir,
                                         map_default_thumbnail_name)

    # TODO: create function to handle map and layer thumbs
    if request.method == 'POST':
        map_thumb_form = ThumbnailImageForm(request.POST, request.FILES)
        if map_thumb_form.is_valid():
            map_new_img = ThumbnailImage(
                thumbnail_image=request.FILES['thumbnail_image']
            )
            map_new_img.save()
            map_obj.save_thumbnail(map_default_thumbnail_name, map_new_img)
            map_user_upload_thumbnail = ThumbnailImage.objects.all()[0]
            map_user_upload_thumbnail_filepath = str(
                map_user_upload_thumbnail.thumbnail_image
            )

            os.rename(map_user_upload_thumbnail_filepath,
                      map_default_thumbnail)

    else:
        map_thumb_form = ThumbnailImageForm()

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


    context_dict = {
        'config': config,
        'resource': map_obj,
        'layers': layers,
        'keywords': keywords,
        'permissions_json': _perms_info_json(map_obj),
        'documents': get_related_documents(map_obj),
        'keywords_form': keywords_form,
        'published_form': published_form,
        'thumbnail': map_thumbnail,
        'thumb_form': map_thumb_form,
        'share_url': share_url,
        'share_title': share_title,
        'share_description': share_description,
        'organizations': org_admin_memberships,
        'initiatives': ini_admin_memberships,
    }

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, map_obj)
    return render_to_response(template, RequestContext(request, context_dict))


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


def account_verify(request):

    access_token = request.GET.get('access_token', '')

    if not access_token:
        auth = request.META.get('HTTP_AUTHORIZATION', b'')
        if type(auth) == type(''):
            # Work around django test client oddness
            auth = auth.encode('iso-8859-1')
        auth = auth.split()
        if auth and auth[0].lower() == 'bearer':
            access_token = auth[1]

    try:
        token = AccessToken.objects.select_related('user')
        token = token.get(token=access_token, expires__gt=provider_now())
    except AccessToken.DoesNotExist:
        msg = 'No access token'
        return HttpResponseForbidden(msg)

    user = token.user

    if not user.is_active:
        msg = 'User inactive or deleted: %s' % user.username
        return HttpResponseForbidden(msg)
    return HttpResponse('{"id":"%s","first_name":"%s","last_name":"%s","username":"%s","email":"%s"}'
            % (user.id, user.first_name, user.last_name, user.username, user.email), mimetype='application/json')


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
    DEFAULT_MAP_CONFIG, DEFAULT_BASE_LAYERS = default_map_config(None)
    map_obj = None
    if request.method == 'GET' and 'copy' in request.GET:
        mapid = request.GET['copy']
        map_obj = _resolve_map(request, mapid, 'base.view_resourcebase')

        map_obj.abstract = DEFAULT_ABSTRACT
        map_obj.title = DEFAULT_TITLE
        map_obj.viewer_playbackmode = DEFAULT_VIEWER_PLAYBACKMODE
        if request.user.is_authenticated():
            map_obj.owner = request.user
        config = map_obj.viewer_json(request.user)
        del config['id']
    else:
        if request.method == 'GET':
            params = request.GET
        elif request.method == 'POST':
            params = request.POST
        else:
            return HttpResponse(status=405)

        if 'layer' in params:
            bbox = None
            map_obj = Map(projection=getattr(settings, 'DEFAULT_MAP_CRS',
                          'EPSG:900913'))
            layers = []
            for layer_name in params.getlist('layer'):
                try:
                    layer = _resolve_layer(request, layer_name)
                except ObjectDoesNotExist:
                    # bad layer, skip
                    continue

                if not request.user.has_perm(
                        'view_resourcebase',
                        obj=layer.get_self_resource()):
                    # invisible layer, skip inclusion
                    continue

                layer_bbox = layer.bbox
                # assert False, str(layer_bbox)
                if bbox is None:
                    bbox = list(layer_bbox[0:4])
                else:
                    bbox[0] = min(bbox[0], layer_bbox[0])
                    bbox[1] = max(bbox[1], layer_bbox[1])
                    bbox[2] = min(bbox[2], layer_bbox[2])
                    bbox[3] = max(bbox[3], layer_bbox[3])

                config = layer.attribute_config()

                # Add required parameters for GXP lazy-loading
                config["title"] = layer.title
                config["queryable"] = True

                config["srs"] = getattr(settings, 'DEFAULT_MAP_CRS', 'EPSG:900913')
                config["bbox"] = bbox if config["srs"] != 'EPSG:900913' \
                    else llbbox_to_mercator([float(coord) for coord in bbox])

                if layer.storeType == "remoteStore":
                    service = layer.service
                    maplayer = MapLayer(map=map_obj,
                                        name=layer.typename,
                                        ows_url=layer.ows_url,
                                        layer_params=json.dumps(config),
                                        visibility=True,
                                        source_params=json.dumps({
                                            "ptype": service.ptype,
                                            "remote": True,
                                            "url": service.base_url,
                                            "name": service.name}))
                else:
                    # for non-remoteStore layers, MapLoom expects layer.ows_url
                    # to actually be this individual layer's full path (e.g.,
                    # mapstory.org.geoserver/workspace/layername/wms)

                    ows_url = '{0}{1}/{2}/wms'.format(
                        settings.OGC_SERVER['default']['PUBLIC_LOCATION'],
                        layer.workspace,
                        layer.name)
                    maplayer = MapLayer(
                        map=map_obj,
                        name=layer.name,
                        ows_url=ows_url,
                        # use DjangoJSONEncoder to handle Decimal values
                        layer_params=json.dumps(config, cls=DjangoJSONEncoder),
                        visibility=True
                    )

                layers.append(maplayer)

            if bbox is not None:
                minx, miny, maxx, maxy = [float(c) for c in bbox]
                x = (minx + maxx) / 2
                y = (miny + maxy) / 2

                if getattr(settings, 'DEFAULT_MAP_CRS', 'EPSG:900913') == "EPSG:4326":
                    center = list((x, y))
                else:
                    center = list(forward_mercator((x, y)))

                if center[1] == float('-inf'):
                    center[1] = 0

                BBOX_DIFFERENCE_THRESHOLD = 1e-5

                # Check if the bbox is invalid
                valid_x = (maxx - minx) ** 2 > BBOX_DIFFERENCE_THRESHOLD
                valid_y = (maxy - miny) ** 2 > BBOX_DIFFERENCE_THRESHOLD

                if valid_x:
                    width_zoom = math.log(360 / abs(maxx - minx), 2)
                else:
                    width_zoom = 15

                if valid_y:
                    height_zoom = math.log(360 / abs(maxy - miny), 2)
                else:
                    height_zoom = 15

                map_obj.center_x = center[0]
                map_obj.center_y = center[1]
                map_obj.zoom = math.ceil(min(width_zoom, height_zoom))

            config = map_obj.viewer_json(
                request.user, *(DEFAULT_BASE_LAYERS + layers))
            config['fromLayer'] = True
        else:
            config = DEFAULT_MAP_CONFIG
    return json.dumps(config)


# TODO should be a util

def clean_config(conf):
    if isinstance(conf, basestring):
        config = json.loads(conf)
        config_extras = [
            "rest",
            "homeUrl",
            "localGeoServerBaseUrl",
            "localCSWBaseUrl",
            "csrfToken",
            "db_datastore",
            "authorizedRoles"]
        for config_item in config_extras:
            if config_item in config:
                del config[config_item]
            if config_item in config["map"]:
                del config["map"][config_item]
        return json.dumps(config)
    else:
        return conf
