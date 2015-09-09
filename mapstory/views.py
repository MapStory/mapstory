import datetime
from account.views import SignupView
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse

from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.http.request import validate_host
from django.shortcuts import render_to_response
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView
from django.views.generic.edit import ModelFormMixin
from django.views.generic.edit import CreateView
from django.views.generic.detail import DetailView
from django.views.generic.edit import UpdateView
from django.views.generic.list import ListView
from django.template import RequestContext
from django.utils.http import is_safe_url
from geonode.base.forms import CategoryForm
from geonode.base.models import TopicCategory
from geonode.layers.models import Layer
from geonode.layers.views import _resolve_layer, _PERMISSION_MSG_METADATA, _PERMISSION_MSG_GENERIC, _PERMISSION_MSG_VIEW
from geonode.people.forms import ProfileForm
from geonode.people.models import Profile
from httplib import HTTPConnection, HTTPSConnection
from mapstory.forms import UploadLayerForm, DeactivateProfileForm, EditProfileForm
from mapstory.models import get_sponsors
from mapstory.models import get_images
from mapstory.models import get_group_layers
from mapstory.models import get_group_maps
from mapstory.models import GetPage
from mapstory.models import NewsItem
from mapstory.models import DiaryEntry
from mapstory.models import Leader
from mapstory.models import Community
from mapstory.models import get_communities
from geonode.base.models import Region
from geonode.contrib.favorite.models import Favorite
from geonode.geoserver.helpers import ogc_server_settings
from urlparse import urlsplit
from user_messages.models import Thread
from .forms import MapStorySignupForm
from geonode.groups.models import GroupProfile

from actstream.models import Action
from actstream.models import actor_stream

from django.utils import simplejson as json
from geonode.maps.models import Map, MapLayer
from geonode.utils import GXPLayer
from geonode.utils import GXPMap
from mapstory.forms import KeywordsForm, MetadataForm, PublishStatusForm
from geonode.utils import resolve_object
from geonode.security.views import _perms_info_json
from geonode.documents.models import get_related_documents
from geonode.utils import build_social_links
from geonode.utils import default_map_config
from django.db.models import F
from django.contrib.auth.models import Group
from django.contrib import messages
from django.contrib.auth import logout


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        ctx['communities'] = get_communities()
        news_items = NewsItem.objects.filter(date__lte=datetime.datetime.now())
        ctx['news_items'] = news_items[:3]
        ctx['images'] = get_images()
        # for now, limit to max of 8.
        ctx['diary_entries'] = DiaryEntry.objects.filter(publish=True,show_on_main=True)[:8]

        return ctx


class DiaryListView(ListView):
    template_name = 'mapstory/diary.html'
    context_object_name = 'entries'
    paginate_by = 10

    def get_queryset(self):
        return DiaryEntry.objects.filter(publish=True)

    def get_context_data(self, **kwargs):
        ctx = super(DiaryListView, self).get_context_data(**kwargs)
        user = self.request.user
        if user.is_authenticated():
            ctx['drafts'] = DiaryEntry.objects.filter(author=user, publish=False)
        return ctx


class DiaryPermissionMixin(object):
    need_publish = False

    def get_object(self, *args, **kwargs):
        obj = super(DiaryPermissionMixin, self).get_object(*args, **kwargs)
        user = self.request.user
        if self.need_publish:
            can_view = obj.publish
        else:
            can_view = user.is_superuser or obj.author == self.request.user
        if not can_view:
            raise PermissionDenied()
        return obj


class DiaryDetailView(DiaryPermissionMixin, DetailView):
    template_name = 'mapstory/diary_detail.html'
    model = DiaryEntry
    need_publish = True
    context_object_name = 'entry'


class DiaryEditMixin(object):
    template_name = 'mapstory/diary_edit.html'
    model = DiaryEntry
    fields = ['title', 'content', 'publish']

    def get_success_url(self):
        return reverse('diary')


class DiaryCreateView(DiaryEditMixin, CreateView):

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.author = self.request.user
        self.object.save()
        return super(ModelFormMixin, self).form_valid(form)


class DiaryUpdateView(DiaryEditMixin, DiaryPermissionMixin, UpdateView):
    pass


class GetPageView(DetailView):
    template_name = 'mapstory/getpage.html'
    model = GetPage
    slug_field = 'name'


class SearchView(TemplateView):
    template_name='search/searchn.html'
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
        ctx['diary_entries'] = DiaryEntry.objects.filter(author=self.object).order_by('-date')
        ctx['favorites'] = Favorite.objects.filter(user=self.object).order_by('-created_on')
        ctx['threads_all'] = Thread.ordered(Thread.objects.inbox(self.request.user))
        ctx['threads_unread'] = Thread.ordered(Thread.objects.unread(self.request.user))
        ctx['action_list'] = actor_stream(ctx['profile'])

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
            "form": form,
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

class CommunityDetail(DetailView):
    # TODO: We need to differentiate between viewing as an outsider or logged in
    template_name = 'mapstory/initiative_visit.html'
    slug_field = 'slug'
    model = Community

    def get_context_data(self, **kwargs):
        ctx = super(CommunityDetail, self).get_context_data(**kwargs)
        ctx['images'] = get_images()

        return ctx

class GroupDetail(DetailView):
    # TODO: We need to differentiate between viewing as an outsider or logged in
    template_name = 'groups/organization_visit.html'
    slug_field = 'slug'
    model = GroupProfile

    def get_context_data(self, **kwargs):
        ctx = super(GroupDetail, self).get_context_data(**kwargs)
        ctx['images'] = get_images()
        ctx['layers'] = get_group_layers(ctx['groupprofile'])
        ctx['maps'] = get_group_maps(ctx['groupprofile'])
        
        return ctx


class LeaderListView(ListView):
    context_object_name = 'leaders'
    model = Leader


def test_view(req, template):
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


class MapStorySignup(SignupView):
    """
    Extends the SignupView to include the user's first and last name.
    """
    form_class = MapStorySignupForm

    def create_account(self, form):
        """
        Save the users first and last name.
        """
        self.created_user.first_name = form.cleaned_data['firstname']
        self.created_user.last_name = form.cleaned_data['lastname']
        self.created_user.save()
        return super(MapStorySignup, self).create_account(form)

@login_required
def layer_metadata(request, layername, template='upload/layer_upload_metadata.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.change_resourcebase_metadata',
        _PERMISSION_MSG_METADATA)
    topic_category = layer.category

    poc = layer.poc or layer.owner
    metadata_author = layer.metadata_author

    if request.method == "POST":
        layer_form = UploadLayerForm(request.POST, instance=layer, prefix="resource")
        category_form = CategoryForm(
            request.POST,
            prefix="category_choice_field",
            initial=int(
                request.POST["category_choice_field"]) if "category_choice_field" in request.POST else None)
    else:
        layer_form = UploadLayerForm(instance=layer, prefix="resource")
        category_form = CategoryForm(
            prefix="category_choice_field",
            initial=topic_category.id if topic_category else None)

    if request.method == "POST" and layer_form.is_valid(
    ) and category_form.is_valid():
        new_poc = layer_form.cleaned_data['poc']
        new_author = layer_form.cleaned_data['metadata_author']
        new_keywords = layer_form.cleaned_data['keywords']

        if new_poc is None:
            if poc is None:
                poc_form = ProfileForm(
                    request.POST,
                    prefix="poc",
                    instance=poc)
            else:
                poc_form = ProfileForm(request.POST, prefix="poc")
            if poc_form.has_changed and poc_form.is_valid():
                new_poc = poc_form.save()

        else:
            if not isinstance(new_poc, Profile):
                new_poc = Profile.objects.get(id=new_poc)

        if new_author is None:
            if metadata_author is None:
                author_form = ProfileForm(request.POST, prefix="author",
                                          instance=metadata_author)
            else:
                author_form = ProfileForm(request.POST, prefix="author")
            if author_form.has_changed and author_form.is_valid():
                new_author = author_form.save()

        else:
            if not isinstance(new_author, Profile):
                new_author = Profile.objects.get(id=new_author)

        new_category = TopicCategory.objects.get(
            id=category_form.cleaned_data['category_choice_field'])

        if new_poc is not None and new_author is not None:
            new_keywords = layer_form.cleaned_data['keywords']
            layer.keywords.clear()
            layer.keywords.add(*new_keywords)
            the_layer = layer_form.save()
            the_layer.poc = new_poc
            the_layer.metadata_author = new_author
            Layer.objects.filter(id=the_layer.id).update(
                category=new_category
                )

            return HttpResponseRedirect(
                reverse(
                    'layer_detail',
                    args=(
                        layer.service_typename,
                    )))

    if poc is None:
        poc_form = ProfileForm(instance=poc, prefix="poc")
    else:
        layer_form.fields['poc'].initial = poc.id
        poc_form = ProfileForm(prefix="poc")
        poc_form.hidden = True

    if metadata_author is None:
        author_form = ProfileForm(instance=metadata_author, prefix="author")
    else:
        layer_form.fields['metadata_author'].initial = metadata_author.id
        author_form = ProfileForm(prefix="author")
        author_form.hidden = True

    return render_to_response(template, RequestContext(request, {
        "layer": layer,
        "layer_form": layer_form,
        "poc_form": poc_form,
        "author_form": author_form,
        "category_form": category_form,
    }))


@login_required
def new_map_json(request):
    from geonode.maps.views import new_map_json
    return new_map_json(request)

@login_required
def new_map(request):
    from geonode.maps.views import new_map
    return new_map(request)

def layer_detail(request, layername, template='layers/layer_detail.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.view_resourcebase',
        _PERMISSION_MSG_VIEW)
    # assert False, str(layer_bbox)
    config = layer.attribute_config()

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

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=layer)
        metadata_form = MetadataForm(request.POST, instance=layer)
        published_form = PublishStatusForm(request.POST, instance=layer)

        if keywords_form.is_valid():
            new_keywords = keywords_form.cleaned_data['keywords']
            layer.keywords.clear()
            layer.keywords.add(*new_keywords)
        if metadata_form.is_valid():
            # update all the metadata
            if metadata_form.cleaned_data['category'] is not None:
                new_category = TopicCategory.objects.get(id=metadata_form.cleaned_data['category'].id)
                Layer.objects.filter(id=layer.id).update(category=new_category)
            new_language = metadata_form.cleaned_data['language']
            new_distribution_url = metadata_form.cleaned_data['distribution_url']
            new_data_quality_statement = metadata_form.cleaned_data['data_quality_statement']
            new_purpose = metadata_form.cleaned_data['purpose']
            layer.language = new_language
            layer.distribution_url = new_distribution_url
            layer.data_quality_statement = new_data_quality_statement
            layer.purpose = new_purpose
            layer.save()
        if published_form.is_valid():
            layer.is_published = published_form.cleaned_data['is_published']
            layer.save()
            
    else:
        keywords_form = KeywordsForm(instance=layer)
        metadata_form = MetadataForm(instance=layer)
        published_form = PublishStatusForm(instance=layer)

    content_moderators = Group.objects.filter(name='content_moderator').first()

    context_dict = {
        "resource": layer,
        "permissions_json": _perms_info_json(layer),
        "documents": get_related_documents(layer),
        "metadata": metadata,
        "is_layer": True,
        "wps_enabled": settings.OGC_SERVER['default']['WPS_ENABLED'],
        "keywords_form": keywords_form,
        "metadata_form": metadata_form,
        "published_form": published_form,
        "content_moderators": content_moderators,
    }

    context_dict["viewer"] = json.dumps(
        map_obj.viewer_json(request.user, * (NON_WMS_BASE_LAYERS + [maplayer])))
    context_dict["preview"] = getattr(
        settings,
        'LAYER_PREVIEW_LIBRARY',
        'leaflet')

    if request.user.has_perm('download_resourcebase', layer.get_self_resource()):
        if layer.storeType == 'dataStore':
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_VECTOR)
        else:
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_RASTER)
        context_dict["links"] = links

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
    return resolve_object(request, Map, {key: id}, permission=permission,
                          permission_msg=msg, **kwargs)

def map_detail(request, mapid, snapshot=None, template='maps/map_detail.html'):
    '''
    The view that show details of each map
    '''

    map_obj = _resolve_map(request, mapid, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    if request.user != map_obj.owner and not request.user.is_superuser:
        Map.objects.filter(id=map_obj.id).update(popular_count=F('popular_count') + 1)

    if snapshot is None:
        config = map_obj.viewer_json(request.user)
    else:
        config = snapshot_config(snapshot, map_obj, request.user)

    config = json.dumps(config)
    layers = MapLayer.objects.filter(map=map_obj.id)

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=map_obj)

        if keywords_form.is_valid():
            new_keywords = keywords_form.cleaned_data['keywords']
            map_obj.keywords.clear()
            map_obj.keywords.add(*new_keywords)
            map_obj.save()
            return HttpResponseRedirect(
                reverse(
                    'map_detail',
                    args=(
                        map_obj.id,
                    )))
    else:
        keywords_form = KeywordsForm(instance=map_obj)

    context_dict = {
        'config': config,
        'resource': map_obj,
        'layers': layers,
        'permissions_json': _perms_info_json(map_obj),
        "documents": get_related_documents(map_obj),
        "keywords_form": keywords_form,
    }

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, map_obj)

    return render_to_response(template, RequestContext(request, context_dict))