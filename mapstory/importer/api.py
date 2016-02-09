import json
import os
from tastypie.fields import IntegerField, DictField, ListField, CharField, ToManyField, ForeignKey
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
from .models import UploadedData, UploadLayer, UploadFile
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import DjangoAuthorization, Authorization
from tastypie.utils import trailing_slash
from tastypie import http
from django.conf.urls import url
from tastypie.bundle import Bundle
from .tasks import import_object
from tastypie.exceptions import ImmediateHttpResponse
from geonode.api.api import ProfileResource
from django.utils.text import slugify
from geonode.geoserver.helpers import ogc_server_settings

class UploadedLayerResource(ModelResource):
    """
    API for accessing UploadedData.
    """

    geonode_layer = DictField(attribute='layer_data', readonly=True, null=True)
    configuration_options = DictField(attribute='configuration_options', null=True)
    fields = ListField(attribute='fields')
    status = CharField(attribute='status', readonly=True, null=True)

    class Meta:
        queryset = UploadLayer.objects.all()
        resource_name = 'data-layers'
        allowed_methods = ['get']
        filtering = {'id': ALL}
        authentication = SessionAuthentication()

    def get_object_list(self, request):
        """
        Filters the list view by the current user.
        """
        return super(UploadedLayerResource, self).get_object_list(request).filter(upload__user=request.user.id)

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
            if configuration_options.get('geoserver_store'):
                store = configuration_options.get('geoserver_store')
                if store.get('type', str).lower() == 'geogig':
                    store.setdefault('branch', 'master')
                    store.setdefault('create', 'true')
                    store.setdefault('name', '{0}-storylayers'.format(request.user.username))
                    store['geogig_repository'] = os.path.join(ogc_server_settings.GEOGIG_DATASTORE_DIR,
                                                              store.get('name'))

            obj.configuration_options = configuration_options
            obj.save()

            if not configuration_options.get('layer_owner'):
                configuration_options['layer_owner'] = obj.upload.user

            configuration_options = [configuration_options]

        if not configuration_options:
            raise ImmediateHttpResponse(response=http.HttpBadRequest('Configuration options missing.'))

        uploaded_file = obj.upload.uploadfile_set.first()
        import_result = import_object.delay(uploaded_file.id, configuration_options=configuration_options)

        # query the db again for this object since it may have been updated during the import
        obj = self.obj_get(b, pk=kwargs.get('pk'))
        obj.task_id = import_result.id
        obj.save()

        return self.create_response(request, {'task': obj.task_id})

    def prepend_urls(self):
        return [url(r"^(?P<resource_name>{0})/(?P<pk>\w[\w/-]*)/configure{1}$".format(self._meta.resource_name,
                                                                                     trailing_slash()),
                self.wrap_view('import_layer'), name="importer_configure"),
                ]


class UserOwnsObjectAuthorization(Authorization):

    # Optional but useful for advanced limiting, such as per user.
    def apply_limits(self, request, object_list):

        if request and hasattr(request, 'user'):
            if request.user.is_superuser:
                return object_list

            return object_list.filter(user=request.user)

        return object_list.none()


class UploadedDataResource(ModelResource):
    """
    API for accessing UploadedData.
    """

    user = ForeignKey(ProfileResource, 'user')
    file_size = CharField(attribute='filesize', readonly=True)
    layers = ToManyField(UploadedLayerResource, 'uploadlayer_set', full=True)
    file_url = CharField(attribute='file_url', readonly=True, null=True)

    class Meta:
        queryset = UploadedData.objects.all()
        resource_name = 'data'
        allowed_methods = ['get', 'delete']
        authorization = UserOwnsObjectAuthorization()
        authentication = SessionAuthentication()
        filtering = {'user': ALL_WITH_RELATIONS}

    def get_object_list(self, request):
        """
        Filters the list view by the current user.
        """
        queryset = super(UploadedDataResource, self).get_object_list(request)

        if not request.user.is_superuser:
            return queryset.filter(user=request.user)

        return queryset


class MultipartResource(object):

    def deserialize(self, request, data, format=None):

        if not format:
            format = request.META.get('CONTENT_TYPE', 'application/json')

        if format == 'application/x-www-form-urlencoded':
            return request.POST

        if format.startswith('multipart/form-data'):
            multipart_data = request.POST.copy()
            multipart_data.update(request.FILES)
            return multipart_data

        return super(MultipartResource, self).deserialize(request, data, format)

    def put_detail(self, request, **kwargs):
        if request.META.get('CONTENT_TYPE', '').startswith('multipart/form-data') and not hasattr(request, '_body'):
            request._body = ''
        return super(MultipartResource, self).put_detail(request, **kwargs)

    def patch_detail(self, request, **kwargs):
        if request.META.get('CONTENT_TYPE', '').startswith('multipart/form-data') and not hasattr(request, '_body'):
            request._body = ''
        return super(MultipartResource, self).patch_detail(request, **kwargs)


class UploadedFileResource(MultipartResource, ModelResource):

    class Meta:
        queryset = UploadFile.objects.all()
        authentication = SessionAuthentication()
        allowed_methods = ['put']
        resource_name = 'file-upload'