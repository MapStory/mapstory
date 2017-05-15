import json
import re

from django.contrib.auth import get_user_model
from django.db.models import Q

from geonode.api.api import TypeFilteredResource, CountJSONSerializer
from osgeo_importer.geonode_apis import UploadedLayerResource
from osgeo_importer.models import UploadedData, UploadLayer, UploadFile
from osgeo_importer.tasks import import_object
from tastypie import http, fields
from tastypie.bundle import Bundle
from tastypie.constants import ALL
from tastypie.exceptions import ImmediateHttpResponse

from mapstory.mapstory_profile.models import MapstoryProfile


class UploadedLayerResource(UploadedLayerResource):
    def import_layer(self, request, **kwargs):
        """
        Imports a layer
        """
        self.method_check(request, allowed=['post'])

        b = Bundle()
        b.request = request

        try:
            obj = self.obj_get(b, pk=kwargs.get('pk'))
        except UploadLayer.DoesNotExist:
            raise ImmediateHttpResponse(response=http.HttpNotFound())

        configuration_options = request.POST.get('configurationOptions')

        if 'application/json' in request.META.get('CONTENT_TYPE', ''):
            configuration_options = json.loads(request.body)

        if isinstance(configuration_options, list) and len(configuration_options) == 1:
            configuration_options = configuration_options[0]

        if isinstance(configuration_options, dict):
            self.clean_configuration_options(request, obj, configuration_options)
            obj.configuration_options = configuration_options
            obj.save()

        if not configuration_options:
            raise ImmediateHttpResponse(response=http.HttpBadRequest('Configuration options missing.'))

        request_cookies = request.COOKIES
        uploaded_file = obj.upload.uploadfile_set.first()
        import_result = import_object.delay(uploaded_file.id, configuration_options=configuration_options, request_cookies=request_cookies, request_user=request.user)

        # query the db again for this object since it may have been updated during the import
        obj = self.obj_get(b, pk=kwargs.get('pk'))
        obj.task_id = import_result.id
        obj.save()

        return self.create_response(request, {'task': obj.task_id})


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

    def build_filters(self, filters={}):

        orm_filters = super(MapstoryOwnersResource, self).build_filters(filters)

        if 'q' in filters:
            orm_filters['q'] = filters['q']

        return orm_filters

    def apply_filters(self, request, applicable_filters):

        q = applicable_filters.pop('q', None)

        semi_filtered = super(
            MapstoryOwnersResource,
            self).apply_filters(
            request,
            applicable_filters)

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
        }
        serializer = OwnerProfileSerializer()
