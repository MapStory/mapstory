import re

from django.conf import settings
from django.conf.urls import url
from django.core.paginator import InvalidPage, Paginator
from django.db.models import Q
from django.http import Http404, HttpResponse
from guardian.shortcuts import get_objects_for_user
from tastypie import fields
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
from tastypie.utils import trailing_slash
from tastypie.utils.mime import build_content_type

from geonode.api.api import (FILTER_TYPES, ProfileResource, RegionResource,
                             TagResource, TopicCategoryResource)
from geonode.api.authorization import GeoNodeAuthorization
from geonode.base.models import ResourceBase
from geonode.documents.models import Document
from geonode.layers.models import Dataset
from mapstory.mapstories.models import Map, MapStory

if settings.HAYSTACK_SEARCH:
    from haystack.query import SearchQuerySet  # noqa

LAYER_SUBTYPES = {
    'vector': 'dataStore',
    'raster': 'coverageStore',
    'remote': 'remoteStore',
}
FILTER_TYPES.update(LAYER_SUBTYPES)


class CommonMetaApi:
    authorization = GeoNodeAuthorization()
    allowed_methods = ['get']
    filtering = {'title': ALL,
                 'keywords': ALL_WITH_RELATIONS,
                 'regions': ALL_WITH_RELATIONS,
                 'category': ALL_WITH_RELATIONS,
                 'owner': ALL_WITH_RELATIONS,
                 'date': ALL,
                 'is_published': ALL,
                 'featured': ALL,
                 }
    ordering = ['date', 'title', 'popular_count', 'rating']
    max_limit = None


class CommonModelApi(ModelResource):
    keywords = fields.ToManyField(TagResource, 'keywords', null=True)
    regions = fields.ToManyField(RegionResource, 'regions', null=True)
    category = fields.ToOneField(
        TopicCategoryResource,
        'category',
        null=True,
        full=True)
    owner = fields.ToOneField(ProfileResource, 'owner', full=True)

    def build_filters(self, filters={}, **kwargs):
        orm_filters = super(CommonModelApi, self).build_filters(
            filters, **kwargs)
        if 'type__in' in filters and filters[
                'type__in'] in list(FILTER_TYPES.keys()):
            orm_filters.update({'type': filters.getlist('type__in')})
        if 'extent' in filters:
            orm_filters.update({'extent': filters['extent']})
        # Nothing returned if +'s are used instead of spaces for text search,
        # so swap them out. Must be a better way of doing this?
        for filter in orm_filters:
            if filter in ['title__contains', 'q']:
                orm_filters[filter] = orm_filters[filter].replace("+", " ")
        return orm_filters

    def apply_filters(self, request, applicable_filters):
        types = applicable_filters.pop('type', None)
        extent = applicable_filters.pop('extent', None)
        semi_filtered = super(
            CommonModelApi,
            self).apply_filters(
            request,
            applicable_filters)
        filtered = None
        if types:
            for the_type in types:
                if the_type in list(LAYER_SUBTYPES.keys()):
                    if filtered:
                        filtered = filtered | semi_filtered.filter(
                            Layer___storeType=LAYER_SUBTYPES[the_type])
                    else:
                        filtered = semi_filtered.filter(
                            Layer___storeType=LAYER_SUBTYPES[the_type])
                else:
                    if filtered:
                        filtered = filtered | semi_filtered.instance_of(
                            FILTER_TYPES[the_type])
                    else:
                        filtered = semi_filtered.instance_of(
                            FILTER_TYPES[the_type])
        else:
            filtered = semi_filtered

        if extent:
            filtered = self.filter_bbox(filtered, extent)
        return filtered

    def filter_bbox(self, queryset, bbox):
        """
        modify the queryset q to limit to data that intersects with the
        provided bbox

        bbox - 4 tuple of floats representing 'southwest_lng,southwest_lat,
        northeast_lng,northeast_lat'
        returns the modified query
        """
        bbox = bbox.split(
            ',')  # TODO: Why is this different when done through haystack?
        bbox = list(map(str, bbox))  # 2.6 compat - float to decimal conversion

        intersects = ~(Q(bbox_x0__gt=bbox[2]) | Q(bbox_x1__lt=bbox[0]) |
                       Q(bbox_y0__gt=bbox[3]) | Q(bbox_y1__lt=bbox[1]))

        return queryset.filter(intersects)

    def build_haystack_filters(self, parameters):
        from haystack.query import SearchQuerySet, SQ  # noqa

        sqs = None

        # Retrieve Query Params

        # Text search
        query = parameters.get('q', None)

        # Types and subtypes to filter (map, layer, vector, etc)
        type_facets = parameters.getlist("type__in", [])

        # If coming from explore page, add type filter from resource_name
        resource_filter = self._meta.resource_name.rstrip("s")
        if resource_filter != "base" and resource_filter not in type_facets:
            type_facets.append(resource_filter)

        # Publication date range (start,end)
        date_end = parameters.get("date__lte", None)
        date_start = parameters.get("date__gte", None)

        # Topic category filter
        category = parameters.getlist("category__identifier__in")

        # Keyword filter
        keywords = parameters.getlist("keywords__slug__in")

        # Region filter
        regions = parameters.getlist("regions__name__in")

        # Owner filters
        owner = parameters.getlist("owner__username__in")

        # Published filter
        published = parameters.get("is_published", None)

        # Featured filter
        featured = parameters.get("featured", None)

        # Sort order
        sort = parameters.get("order_by", "relevance")

        # Geospatial Elements
        bbox = parameters.get("extent", None)

        # Filter by Type and subtype
        if type_facets is not None:

            types = []
            subtypes = []

            for type in type_facets:
                if type in ["map", "mapstory", "layer", "document", "user", "group"]:
                    # Type is one of our Major Types (not a sub type)
                    types.append(type)
                elif type in list(LAYER_SUBTYPES.keys()):
                    subtypes.append(type)

            if len(subtypes) > 0:
                types.append("layer")
                sqs = SearchQuerySet().narrow("subtype:%s" %
                                              ','.join(map(str, subtypes)))

            if len(types) > 0:
                sqs = (SearchQuerySet() if sqs is None else sqs).narrow(
                    "type:%s" % ','.join(map(str, types)))

        # Filter by Query Params
        # haystack bug? if boosted fields aren't included in the
        # query, then the score won't be affected by the boost
        if query:
            if query.startswith('"') or query.startswith('\''):
                # Match exact phrase
                phrase = query.replace('"', '')
                sqs = (SearchQuerySet() if sqs is None else sqs).filter(
                    SQ(title__exact=phrase) |
                    SQ(description__exact=phrase) |
                    SQ(content__exact=phrase)
                )
            else:
                words = [
                    w for w in re.split(
                        '\W',
                        query,
                        flags=re.UNICODE) if w]
                for i, search_word in enumerate(words):
                    if i == 0:
                        sqs = (SearchQuerySet() if sqs is None else sqs) \
                            .filter(
                            SQ(title__contains=search_word) |
                            SQ(description__contains=search_word) |
                            SQ(content__contains=search_word)
                        )
                    elif search_word in ["AND", "OR"]:
                        pass
                    elif words[i - 1] == "OR":  # previous word OR this word
                        sqs = sqs.filter_or(
                            SQ(title__contains=search_word) |
                            SQ(description__contains=search_word) |
                            SQ(content__contains=search_word)
                        )
                    else:  # previous word AND this word
                        sqs = sqs.filter(
                            SQ(title__contains=search_word) |
                            SQ(description__contains=search_word) |
                            SQ(content__contains=search_word)
                        )

        # filter by category
        if category:
            sqs = (SearchQuerySet() if sqs is None else sqs).narrow(
                'category:%s' % ','.join(map(str, category)))

        # filter by keyword: use filter_or with keywords_exact
        # not using exact leads to fuzzy matching and too many results
        # using narrow with exact leads to zero results if multiple keywords
        # selected
        if keywords:
            for keyword in keywords:
                sqs = (
                    SearchQuerySet() if sqs is None else sqs).filter_or(
                    keywords_exact=keyword)

        # filter by regions: use filter_or with regions_exact
        # not using exact leads to fuzzy matching and too many results
        # using narrow with exact leads to zero results if multiple keywords
        # selected
        if regions:
            for region in regions:
                sqs = (
                    SearchQuerySet() if sqs is None else sqs).filter_or(
                    regions_exact__exact=region)

        # filter by owner
        if owner:
            sqs = (
                SearchQuerySet() if sqs is None else sqs).narrow(
                    "owner__username:%s" % ','.join(map(str, owner)))

        # filter by publishing status
        if published:
            sqs = (SearchQuerySet() if sqs is None else sqs).filter(
                SQ(is_published=published)
            )

        # filter by featured status
        if featured:
            sqs = (SearchQuerySet() if sqs is None else sqs).filter(
                SQ(featured=featured)
            )

        # filter by date
        if date_start:
            sqs = (SearchQuerySet() if sqs is None else sqs).filter(
                SQ(date__gte=date_start)
            )

        if date_end:
            sqs = (SearchQuerySet() if sqs is None else sqs).filter(
                SQ(date__lte=date_end)
            )

        # Filter by geographic bounding box
        if bbox:
            left, bottom, right, top = bbox.split(',')
            sqs = (
                SearchQuerySet() if sqs is None else sqs).exclude(
                SQ(
                    bbox_top__lte=bottom) | SQ(
                    bbox_bottom__gte=top) | SQ(
                    bbox_left__gte=right) | SQ(
                        bbox_right__lte=left))

        # Apply sort
        if sort.lower() == "-date":
            sqs = (
                SearchQuerySet() if sqs is None else sqs).order_by("-date")
        elif sort.lower() == "date":
            sqs = (
                SearchQuerySet() if sqs is None else sqs).order_by("date")
        elif sort.lower() == "title":
            sqs = (SearchQuerySet() if sqs is None else sqs).order_by(
                "title_sortable")
        elif sort.lower() == "-title":
            sqs = (SearchQuerySet() if sqs is None else sqs).order_by(
                "-title_sortable")
        elif sort.lower() == "-popular_count":
            sqs = (SearchQuerySet() if sqs is None else sqs).order_by(
                "-popular_count")
        else:
            sqs = (
                SearchQuerySet() if sqs is None else sqs).order_by("-date")

        return sqs

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Get the list of objects that matches the filter
        sqs = self.build_haystack_filters(request.GET)

        if not settings.SKIP_PERMS_FILTER:
            # Get the list of objects the user has access to
            filter_set = get_objects_for_user(
                request.user, 'base.view_resourcebase')
            if settings.RESOURCE_PUBLISHING:
                filter_set = filter_set.filter(is_published=True)

            filter_set_ids = filter_set.values_list('id')
            # Do the query using the filterset and the query term. Facet the
            # results
            if len(filter_set) > 0:
                sqs = sqs.filter(id__in=filter_set_ids).facet('type').facet('subtype').facet('owner')\
                    .facet('keywords').facet('regions').facet('category')
            else:
                sqs = None
        else:
            sqs = sqs.facet('type').facet('subtype').facet(
                'owner').facet('keywords').facet('regions').facet('category')

        if sqs:
            # Build the Facet dict
            facets = {}
            for facet in sqs.facet_counts()['fields']:
                facets[facet] = {}
                for item in sqs.facet_counts()['fields'][facet]:
                    facets[facet][item[0]] = item[1]

            # Paginate the results
            paginator = Paginator(sqs, request.GET.get('limit', 1))

            try:
                page = paginator.page(
                    int(request.GET.get('offset', 0)) /
                    int(request.GET.get('limit', 1)) + 1)
            except InvalidPage:
                raise Http404("Sorry, no results on that page.")

            current_page = page.number
            start_index = page.start_index()
            end_index = page.end_index()
            num_pages = paginator.num_pages

            total_count = sqs.count()
            objects = page.object_list
        else:
            end_index = 0
            num_pages = 0
            current_page = 0
            start_index = 0
            total_count = 0
            facets = {}
            objects = []

        object_list = {
            "meta": {"end_index": end_index,
                     "limit": settings.CLIENT_RESULTS_LIMIT,
                     "num_pages": num_pages,
                     "offset": int(getattr(request.GET, 'offset', 0)),
                     "current_page": current_page,
                     "start_index": start_index,
                     "total_count": total_count,
                     "facets": facets,
                     },
            'objects': [self.get_haystack_api_fields(x) for x in objects],
        }
        self.log_throttled_access(request)
        return self.create_response(request, object_list)

    def get_haystack_api_fields(self, haystack_object):
        object_fields = dict((k, v) for k, v in list(haystack_object.get_stored_fields().items())
                             if not re.search('_exact$|_sortable$', k))
        return object_fields

    def get_list(self, request, **kwargs):
        """
        Returns a serialized list of resources.

        Calls ``obj_get_list`` to provide the data, then handles that result
        set and serializes it.

        Should return a HttpResponse (200 OK).
        """
        # TODO: Uncached for now. Invalidation that works for everyone may be
        # impossible.
        base_bundle = self.build_bundle(request=request)
        objects = self.obj_get_list(
            bundle=base_bundle,
            **self.remove_api_resource_names(kwargs))
        sorted_objects = self.apply_sorting(objects, options=request.GET)

        paginator = self._meta.paginator_class(
            request.GET,
            sorted_objects,
            resource_uri=self.get_resource_uri(),
            limit=self._meta.limit,
            max_limit=self._meta.max_limit,
            collection_name=self._meta.collection_name)
        to_be_serialized = paginator.page()

        to_be_serialized = self.alter_list_data_to_serialize(
            request,
            to_be_serialized)
        return self.create_response(request, to_be_serialized)

    def create_response(
            self,
            request,
            data,
            response_class=HttpResponse,
            **response_kwargs):
        """
        Extracts the common "which-format/serialize/return-response" cycle.

        Mostly a useful shortcut/hook.
        """
        VALUES = [
            # fields in the db
            'id',
            'uuid',
            'title',
            'date',
            'abstract',
            'csw_wkt_geometry',
            'csw_type',
            'distribution_description',
            'distribution_url',
            'owner__username',
            'share_count',
            'popular_count',
            'srid',
            'category__gn_description',
            'supplemental_information',
            'thumbnail_url',
            'detail_url',
            'rating',
        ]

        if isinstance(
                data,
                dict) and 'objects' in data and not isinstance(
                data['objects'],
                list):
            data['objects'] = list(data['objects'].values(*VALUES))

        desired_format = self.determine_format(request)
        serialized = self.serialize(request, data, desired_format)

        return response_class(
            content=serialized,
            content_type=build_content_type(desired_format),
            **response_kwargs)

    def prepend_urls(self):
        if settings.HAYSTACK_SEARCH:
            return [
                url(r"^(?P<resource_name>%s)/search%s$" % (
                    self._meta.resource_name, trailing_slash()
                ),
                    self.wrap_view('get_search'), name="api_get_search"),
            ]
        else:
            return []


class ResourceBaseResource(CommonModelApi):

    """ResourceBase api"""

    class Meta(CommonMetaApi):
        queryset = ResourceBase.objects.polymorphic_queryset() \
            .distinct().order_by('-date')
        if settings.RESOURCE_PUBLISHING:
            queryset = queryset.filter(is_published=True)
        resource_name = 'base'
        excludes = ['csw_anytext', 'metadata_xml']


class FeaturedResourceBaseResource(CommonModelApi):

    """Only the featured resourcebases"""

    class Meta(CommonMetaApi):
        queryset = ResourceBase.objects.filter(featured=True).order_by('-date')
        if settings.RESOURCE_PUBLISHING:
            queryset = queryset.filter(is_published=True)
        resource_name = 'featured'


class MapStoryResource(CommonModelApi):
    """MapStory API"""

    chapters = fields.ListField(attribute='get_chapter_info')

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/slug/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view(
                'dispatch_detail'), name="api_dispatch_detail"),
        ]

    class Meta(CommonMetaApi):
        queryset = MapStory.objects.distinct().order_by('-date')
        if settings.RESOURCE_PUBLISHING:
            queryset = queryset.filter(is_published=True)
        resource_name = 'mapstories'
        filtering = {
            'id': ALL,
            'slug': ALL
        }
