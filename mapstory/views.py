import contextlib
import csv
import datetime
import ogr
import shutil
import StringIO
import tempfile
import zipfile
from account.views import ConfirmEmailView
from account.views import SignupView
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.core.urlresolvers import reverse
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.http.request import validate_host
from django.shortcuts import render_to_response, render, redirect, get_object_or_404
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.template import RequestContext
from django.utils.http import is_safe_url
from django.utils.translation import ugettext as _
from geonode.base.models import TopicCategory, Region
from geonode.layers.models import Layer
from geonode.layers.views import _resolve_layer
from geonode.layers.views import _PERMISSION_MSG_GENERIC, _PERMISSION_MSG_VIEW, _PERMISSION_MSG_DELETE
from geonode.people.models import Profile
from geonode.geoserver.views import layer_acls, resolve_user
from geonode.maps.views import snapshot_config, _PERMISSION_MSG_SAVE
from geonode.maps.models import Map, MapStory
from httplib import HTTPConnection, HTTPSConnection
from mapstory import tasks
from mapstory.importers import GeoServerLayerCreator
from mapstory.utils import has_exception, parse_wfst_response, print_exception
from mapstory.models import get_sponsors, get_images, get_featured_groups
from mapstory.models import GetPage
from mapstory.models import NewsItem
from journal.models import JournalEntry
from mapstory.models import Leader
from mapstory.apps.thumbnails.models import ThumbnailImage, ThumbnailImageForm
from icon_commons.models import Icon
from geonode.contrib.favorite.models import Favorite
from geonode.contrib.collections.models import Collection
from geonode.geoserver.helpers import ogc_server_settings
from urlparse import urlsplit
from user_messages.models import Thread
from actstream.models import actor_stream


from geonode.utils import GXPLayer, GXPMap
from geonode.utils import resolve_object
from geonode.utils import build_social_links
from geonode.utils import default_map_config
from mapstory.forms import DeactivateProfileForm, EditProfileForm
from mapstory.forms import KeywordsForm, MetadataForm, PublishStatusForm
from mapstory.forms import OrganizationForm, OrganizationUpdateForm
from mapstory.forms import SignupForm
from geonode.security.views import _perms_info_json
from geonode.documents.models import get_related_documents

from django.db.models import F
from django.contrib.auth.models import Group
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth import get_user_model

from geonode.tasks.deletion import delete_mapstory, delete_layer
from provider.oauth2.models import AccessToken
from django.utils.timezone import now as provider_now
from account.conf import settings as account_settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from osgeo_importer.forms import UploadFileForm
from celery import group
from lxml import etree
from notification.models import NoticeSetting, NoticeType, NOTICE_MEDIA

from .notifications import PROFILE_NOTICE_SETTINGS
from osgeo_importer.utils import UploadError, launder

import json
import os
import requests
from geonode.groups.models import GroupProfile, GroupMember
from geonode.groups.forms import GroupInviteForm, GroupForm, GroupUpdateForm, GroupMemberForm
from mapstory.search.utils import update_es_index


from django.http import HttpResponse, HttpResponseServerError
from django.template import loader
from health_check.plugins import plugin_dir

from journal.models import get_group_journals


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        ctx['communities'] = get_featured_groups()
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
    template_name='search/explore.html'
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

        return ctx

@login_required
def profile_edit(request, username=None):
    if username is None:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return redirect("profile_browse")
    else:
        profile = get_object_or_404(Profile, username=username)

    if username == request.user.username:
        if request.method == "POST":
            form = EditProfileForm(request.POST, instance=profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Profile profile updated.")
                return redirect(
                    reverse(
                        'profile_detail',
                        args=[
                            request.user.username]))
        else:
            form = EditProfileForm(instance=profile)
          
        return render(request, "people/profile_edit.html", {
            "form": form
        })
    else:
        return HttpResponseForbidden(
            'You are not allowed to edit other users profile')

@login_required
def health_check(request):
    plugins = []
    working = True
    for plugin_class, plugin in plugin_dir._registry.items():
        plugin = plugin_class()
        if not plugin.status:  # Will return True or None
            working = False
        plugins.append(plugin)
    plugins.sort(key=lambda x: x.identifier())

    if working:
        return HttpResponse(loader.render_to_string("health_check/dashboard.html", {'plugins': plugins}))
    else:
        return HttpResponseServerError(loader.render_to_string("health_check/dashboard.html", {'plugins': plugins}))


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

# TODO: Refactor this code to use content mixins and class based views so it avoids repetition
def organization_detail(request, slug):
    group = GroupProfile.objects.get(slug=slug)

    if not group.profile_type == 'org':
        return HttpResponse(status=404)

    return render_to_response("groups/organization_detail.html", {
        "id": group.id,
        "images": get_images(),
        "journals": get_group_journals(group),
        "managers": group.get_managers().all()
        }, context_instance=RequestContext(request))

def initiative_detail(request, slug):
    group = GroupProfile.objects.get(slug=slug)

    if not group.profile_type == 'ini':
        return HttpResponse(status=404)

    return render_to_response("groups/initiative_detail.html", {
        "id": group.id,
        "images": get_images(),
        "journals": get_group_journals(group),
        "managers": group.get_managers().all()
        }, context_instance=RequestContext(request))

@login_required
def organization_create(request):
    if request.method == "POST":
        form = OrganizationForm(request.POST, request.FILES)
        if form.is_valid():
            group = form.save(commit=False)
            group.profile_type = 'org'
            group.save()
            form.save_m2m()
            group.join(request.user, role="manager")
            # Create the collection corresponding to this organization
            collection = Collection()
            collection.name = group.title
            collection.slug = group.slug
            collection.group = group
            collection.save()
            return HttpResponseRedirect(
                reverse(
                    "organization_detail",
                    args=[
                        group.slug]))
    else:
        form = OrganizationForm(initial={'profile_type': 'org'})

    if request.user.is_superuser:
        return render_to_response("groups/group_create.html", {
            "form": form,
            }, context_instance=RequestContext(request))
    else:
        return HttpResponse(status=403)

@login_required
def initiative_create(request):
    if request.method == "POST":
        form = GroupForm(request.POST, request.FILES)
        if form.is_valid():
            group = form.save(commit=False)
            group.profile_type = 'ini'
            group.save()
            form.save_m2m()
            group.join(request.user, role="manager")
            # Create the collection corresponding to this initiative
            collection = Collection()
            collection.name = group.title
            collection.slug = group.slug
            collection.group = group
            collection.save()
            return HttpResponseRedirect(
                reverse(
                    "initiative_detail",
                    args=[
                        group.slug]))
    else:
        form = GroupForm(initial={'profile_type': 'ini'})

    if request.user.is_superuser:
        return render_to_response("groups/group_create.html", {
            "form": form,
            }, context_instance=RequestContext(request))
    else:
        return HttpResponse(status=403)

@login_required
def organization_edit(request, slug):
    group = GroupProfile.objects.get(slug=slug)
    if not group.profile_type == 'org':
        return HttpResponse(status=404)
    # Can use this function to toggle manager view
    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()

    if request.method == "POST":
        form = OrganizationUpdateForm(request.POST, request.FILES, instance=group)
        if form.is_valid():
            group = form.save(commit=False)
            group.save()
            form.save_m2m()
            return HttpResponseRedirect(
                reverse(
                    "organization_detail",
                    args=[
                        group.slug]))
    else:
        form = OrganizationForm(instance=group)

    return render_to_response("groups/group_update.html", {
        "form": form,
        "group": group,
    }, context_instance=RequestContext(request))

@login_required
def initiative_edit(request, slug):
    group = GroupProfile.objects.get(slug=slug)
    if not group.profile_type == 'ini':
        return HttpResponse(status=404)
    # Can use this function to toggle manager view
    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()

    if request.method == "POST":
        form = GroupUpdateForm(request.POST, request.FILES, instance=group)
        if form.is_valid():
            group = form.save(commit=False)
            group.save()
            form.save_m2m()
            return HttpResponseRedirect(
                reverse(
                    "organization_detail",
                    args=[
                        group.slug]))
    else:
        form = GroupForm(instance=group)

    return render_to_response("groups/group_update.html", {
        "form": form,
        "group": group,
    }, context_instance=RequestContext(request))

def organization_members(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)
    ctx = {}

    if not group.can_view(request.user):
        raise Http404()

    if group.access in [
            "public-invite",
            "private"] and group.user_is_role(
            request.user,
            "manager"):
        ctx["invite_form"] = GroupInviteForm()

    if group.user_is_role(request.user, "manager"):
        ctx["member_form"] = GroupMemberForm()

    ctx.update({
        "group": group,
        "members": group.member_queryset(),
        "is_member": group.user_is_member(request.user),
        "is_manager": group.user_is_role(request.user, "manager"),
    })
    ctx = RequestContext(request, ctx)
    return render_to_response("groups/organization_members.html", ctx)

@require_POST
@login_required
def organization_members_add(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)

    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()

    form = GroupMemberForm(request.POST)

    if form.is_valid():
        role = form.cleaned_data["role"]
        for user in form.cleaned_data["user_identifiers"]:
            group.join(user, role=role)

    return redirect("organization_detail", slug=group.slug)

@login_required
def organization_member_remove(request, slug, username):
    group = get_object_or_404(GroupProfile, slug=slug)
    user = get_object_or_404(get_user_model(), username=username)

    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()
    else:
        GroupMember.objects.get(group=group, user=user).delete()
        user.groups.remove(group.group)
        return redirect("organization_detail", slug=group.slug)

@require_POST
def organization_invite(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)

    if not group.can_invite(request.user):
        raise Http404()

    form = GroupInviteForm(request.POST)

    if form.is_valid():
        for user in form.cleaned_data["invite_user_identifiers"].split("\n"):
            group.invite(
                user,
                request.user,
                role=form.cleaned_data["invite_role"])

    return redirect("organization_members", slug=group.slug)

def initiative_members(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)
    ctx = {}

    if not group.can_view(request.user):
        raise Http404()

    if group.access in [
            "public-invite",
            "private"] and group.user_is_role(
            request.user,
            "manager"):
        ctx["invite_form"] = GroupInviteForm()

    if group.user_is_role(request.user, "manager"):
        ctx["member_form"] = GroupMemberForm()

    ctx.update({
        "group": group,
        "members": group.member_queryset(),
        "is_member": group.user_is_member(request.user),
        "is_manager": group.user_is_role(request.user, "manager"),
    })
    ctx = RequestContext(request, ctx)
    return render_to_response("groups/initiative_members.html", ctx)

@require_POST
@login_required
def initiative_members_add(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)

    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()

    form = GroupMemberForm(request.POST)

    if form.is_valid():
        role = form.cleaned_data["role"]
        for user in form.cleaned_data["user_identifiers"]:
            group.join(user, role=role)

    return redirect("initiative_detail", slug=group.slug)

@login_required
def initiative_member_remove(request, slug, username):
    group = get_object_or_404(GroupProfile, slug=slug)
    user = get_object_or_404(get_user_model(), username=username)

    if not group.user_is_role(request.user, role="manager"):
        return HttpResponseForbidden()
    else:
        GroupMember.objects.get(group=group, user=user).delete()
        user.groups.remove(group.group)
        return redirect("initiative_detail", slug=group.slug)

@require_POST
def initiative_invite(request, slug):
    group = get_object_or_404(GroupProfile, slug=slug)

    if not group.can_invite(request.user):
        raise Http404()

    form = GroupInviteForm(request.POST)

    if form.is_valid():
        for user in form.cleaned_data["invite_user_identifiers"].split("\n"):
            group.invite(
                user,
                request.user,
                role=form.cleaned_data["invite_role"])

    return redirect("initiative_members", slug=group.slug)

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
    from geonode.maps.views import new_map_json
    return new_map_json(request)

def mapstory_view(request, storyid, snapshot=None, template='viewer/story_viewer.html'):
    """
    The view that returns the map viewer opened to
    the mapstory with the given ID.
    """

    story_obj = _resolve_map(request, storyid, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    if snapshot is None:
        config = story_obj.viewer_json(request.user)
    else:
        config = snapshot_config(snapshot, story_obj, request.user)

    return render_to_response(template, RequestContext(request, {
        'config': json.dumps(config)
    }))

def _resolve_story(request, id, permission='base.change_resourcebase',
                 msg=_PERMISSION_MSG_GENERIC, **kwargs):
    '''
    Resolve the Map by the provided typename and check the optional permission.
    '''
    if id.isdigit():
        key = 'pk'
    else:
        key = 'urlsuffix'
    return resolve_object(request, MapStory, {key: id}, permission=permission,
                          permission_msg=msg, **kwargs)

def draft_view(request, storyid, template='composer/maploom.html'):

    story_obj = _resolve_story(request, storyid, 'base.change_resourcebase', _PERMISSION_MSG_SAVE)

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
    from geonode.maps.views import new_map
    return new_map(request, template)

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
            print attribute['name']

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
    #insert_tasks = group(tasks.append_feature_chunks.subtask((features,wfst_insert_template,get_features_request,target)) for features in features_chunks)
    #results = insert_tasks.apply_async()
    #insert_summary = results.join()

    return summary_aggregate


def download_append_csv(request):

    # Retrieve the CSV and save it in a variable
    csv_url = request.session['csv_link']
    csv_name = '{}.csv'.format(request.session['csv_name'])
    original_csv_download = requests.get(csv_url)
    original_csv = csv.DictReader(original_csv_download)
    original_csv.fieldnames = [field_name.lower() for field_name in original_csv.fieldnames]

    # Remove the FID and OGC_FID fields
    if 'fid' in original_csv.fieldnames:
        original_csv.fieldnames.remove('fid')
    if 'ogc_fid' in original_csv.fieldnames:
        original_csv.fieldnames.remove('ogc_fid')

    # Create the new CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename={}'.format(csv_name)
    writer = csv.writer(response)
    writer.writerow(original_csv.fieldnames)

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
    the fields that are unnecessary for appending data to that
    """

    # Create a temporary directory that is removed after the user downloads the zipfile.
    with temporary_directory() as tempdir:

        shp_url = request.session['shp_link']
        shp_name = '{}.zip'.format(request.session['shp_name'])
        print tempdir

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
                print os.path.join(dirname, filename)
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

    # TODO (Mapstory): This has been commented out to force the client to make a getCapabilities request in order
    # to pull in the time dimension data.  Ideally we would cache time data just like the srs and bbox data to prevent
    # making the getCapabilities request.

    # Add required parameters for GXP lazy-loading
    #layer_bbox = layer.bbox
    #bbox = [float(coord) for coord in list(layer_bbox[0:4])]
    #srid = layer.srid

    # Transform WGS84 to Mercator.
    #config["srs"] = srid if srid != "EPSG:4326" else "EPSG:900913"
    #config["bbox"] = llbbox_to_mercator([float(coord) for coord in bbox])

    #config["title"] = layer.title
    #config["queryable"] = True


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
        la for la in default_map_config()[1] if la.ows_url is None]

    metadata = layer.link_set.metadata().filter(
        name__in=settings.DOWNLOAD_FORMATS_METADATA)

    keywords = json.dumps([tag.name for tag in layer.keywords.all()])

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=layer)
        metadata_form = MetadataForm(instance=layer)
        if 'keywords' in request.POST:
            if keywords_form.is_valid():
                keywords_form.save()
                new_keywords = keywords_form.cleaned_data['keywords']
                layer.keywords.set(*new_keywords)
                layer.save()
            metadata_form = MetadataForm(instance=layer)
            published_form = PublishStatusForm(instance=layer)
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
                layer.distribution_url = metadata_form.cleaned_data['distribution_url']
                layer.data_quality_statement = metadata_form.cleaned_data['data_quality_statement']
                layer.purpose = metadata_form.cleaned_data['purpose']
                layer.is_published = metadata_form.cleaned_data['is_published']
                layer.save()                
            keywords_form = KeywordsForm(instance=layer)
        elif 'add_keyword' in request.POST:
            layer.keywords.add(request.POST['add_keyword'])
            layer.save()
        elif 'remove_keyword' in request.POST:
            layer.keywords.remove(request.POST['remove_keyword'])
            layer.save()
    else:
        keywords_form = KeywordsForm(instance=layer)
        metadata_form = MetadataForm(instance=layer)

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
        "content_moderators": content_moderators,
        "thumbnail": thumbnail,
        "thumb_form": thumb_form
    }

    context_dict["viewer"] = json.dumps(
        map_obj.viewer_json(request.user, * (NON_WMS_BASE_LAYERS + [maplayer])))
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

    layer_property_names = []
    for attrib in layer.attributes:
        if attrib.attribute not in settings.SCHEMA_DOWNLOAD_EXCLUDE and not (attrib.attribute.endswith('_xd') or attrib.attribute.endswith('_parsed')):
            layer_property_names.append(attrib.attribute)
    layer_attrib_string = ','.join(layer_property_names)

    shapefile_link = layer.link_set.download().filter(mime='SHAPE-ZIP').first()
    if shapefile_link is not None:
        shapefile_link = shapefile_link.url + '&featureID=fakeID' + '&propertyName=' + layer_attrib_string
        context_dict["shapefile_link"] = shapefile_link

    csv_link = layer.link_set.download().filter(mime='csv').first()
    if csv_link is not None:
        csv_link = csv_link.url + '&featureID=fakeID'  + '&propertyName=' + layer_attrib_string
        context_dict["csv_link"] = csv_link

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
        key = 'urlsuffix'
    return resolve_object(request, MapStory, {key: id}, permission=permission,
                          permission_msg=msg, **kwargs)

def map_detail(request, mapid, snapshot=None, template='maps/map_detail.html'):
    '''
    The view that show details of each map
    '''

    map_obj = _resolve_map(request, mapid, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

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
                keywords_form.save()
                new_keywords = keywords_form.cleaned_data['keywords']
                map_obj.keywords.set(*new_keywords)
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
    map_default_thumbnail_name = 'map' + str(mapid) + '.jpg'
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
        'thumb_form': map_thumb_form
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
            delete_layer.delay(object_id=layer.id)
        except Exception as e:
            message = '{0}: {1}.'.format(_('Unable to delete layer'), layer.typename)

            if 'referenced by layer group' in getattr(e, 'message', ''):
                message = _('This layer is a member of a layer group, you must remove the layer from the group '
                            'before deleting.')

            messages.error(request, message)
            return render_to_response(template, RequestContext(request, {"layer": layer}))
        return HttpResponseRedirect(reverse("index_view"))
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
        delete_mapstory.delay(object_id=map_obj.id)
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


def messages_redirect(request):
    return HttpResponseRedirect("/storyteller/{}/#messages_list".format(request.user))


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
