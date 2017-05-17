from django.contrib.auth import get_user_model

from geonode.api.api import TypeFilteredResource, CountJSONSerializer
from tastypie import http, fields
from tastypie.constants import ALL

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

    class Meta:
        queryset = get_user_model().objects.exclude(username='AnonymousUser')

        resource_name = 'owners'
        allowed_methods = ['get']
        ordering = ['username', 'date_joined']
        excludes = ['is_staff', 'password', 'is_superuser',
                    'last_login']

        filtering = {
            'username': ALL,
        }
        serializer = OwnerProfileSerializer()
