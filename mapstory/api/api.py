import re

from django.contrib.auth import get_user_model
from django.db.models import Q

from geonode.api.api import TypeFilteredResource, CountJSONSerializer
from tastypie import http, fields
from tastypie.constants import ALL, ALL_WITH_RELATIONS

from mapstory.mapstory_profile.models import MapstoryProfile


class OwnerProfileSerializer(CountJSONSerializer):
    """Serialize Geonode's core user model together with Mapstory's add-on
    profile."""

    def to_json(self, data, options=None):
        options = options or {}
        data = self.to_simple(data, options)
        owners = data["objects"]
        for owner in owners:
            # flatten the foreignKey 'mapstoryprofile';
            # for owners & mapstory profiles specifically,
            # we aren't worried about key collision
            for k in owner["mapstoryprofile"]:
                owner[k] = owner["mapstoryprofile"][k]
            owner.pop("mapstoryprofile")
        return super(OwnerProfileSerializer, self).to_json(data, options)


class MapstoryProfileResource(TypeFilteredResource):

    class Meta:
        queryset = MapstoryProfile.objects.all()

        filtering = {
            'Volunteer_Technical_Community': ALL
        }

class MapstoryOwnersResource(TypeFilteredResource):
    """Mapstory's version of GeoNode's /api/owners Resource """

    mapstoryprofile = fields.ForeignKey(
        MapstoryProfileResource,
        'mapstoryprofile',
        full=True)

    def serialize(self, request, data, format, options=None):
        if options is None:
            options = {}
        options['count_type'] = 'owner'

        return super(MapstoryOwnersResource, self).serialize(
            request, data, format, options)

    def build_filters(self, filters={}):

        orm_filters = super(MapstoryOwnersResource, self).build_filters(filters)

        if 'interest_list' in filters:
            query = filters['interest_list']
            qset = (Q(keywords__slug__iexact=query))
            orm_filters['interest_list'] = qset
        if 'q' in filters:
            orm_filters['q'] = filters['q']

        return orm_filters

    def apply_filters(self, request, applicable_filters):

        q = applicable_filters.pop('q', None)

        if 'interest_list' in applicable_filters:
            interest_list = applicable_filters.pop('interest_list')
        else:
            interest_list = None

        semi_filtered = super(
            MapstoryOwnersResource,
            self).apply_filters(
            request,
            applicable_filters)

        if interest_list is not None:
            semi_filtered = semi_filtered.filter(interest_list)
        if q:
            names = [
                w for w in re.split(
                    '\W',
                    q,
                    flags=re.UNICODE) if w]
            for i, search_name in enumerate(names):
                semi_filtered = semi_filtered.filter(
                    Q(username__icontains=search_name) |
                    Q(first_name__icontains=search_name) |
                    Q(last_name__icontains=search_name)
                )

        return semi_filtered

    class Meta:
        queryset = get_user_model().objects.exclude(username='AnonymousUser').exclude(is_active=False)

        resource_name = 'owners'
        allowed_methods = ['get']
        ordering = ['username', 'date_joined']
        excludes = ['is_staff', 'password', 'is_superuser',
                    'last_login']

        filtering = {
            'username': ALL,
            'city': ALL,
            'country': ALL,
            'mapstoryprofile': ALL_WITH_RELATIONS
        }
        serializer = OwnerProfileSerializer()
