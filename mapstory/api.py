import json
from osgeo_importer.geonode_apis import UploadedLayerResource
from osgeo_importer.models import UploadedData, UploadLayer, UploadFile
from osgeo_importer.tasks import import_object
from tastypie.bundle import Bundle
from tastypie.exceptions import ImmediateHttpResponse
from tastypie import http


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
        import_result = import_object.delay(uploaded_file.id, configuration_options=configuration_options, request_cookies=request_cookies)

        # query the db again for this object since it may have been updated during the import
        obj = self.obj_get(b, pk=kwargs.get('pk'))
        obj.task_id = import_result.id
        obj.save()

        return self.create_response(request, {'task': obj.task_id})