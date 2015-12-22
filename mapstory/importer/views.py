from django.views.generic import FormView, ListView
from django.core.urlresolvers import reverse_lazy

from .forms import UploadFileForm
from .models import UploadedData, UploadLayer, DEFAULT_LAYER_CONFIGURATION
from .inspectors import GDALInspector


class UploadListView(ListView):
    model = UploadedData
    template_name = 'importer/uploads-list.html'
    queryset = UploadedData.objects.all()


class ImportHelper(object):
    """
    Import Helpers
    """

    inspector = GDALInspector

    def get_fields(self, path):
        """
        Returns a list of field names and types.
        """

        with self.inspector(path) as opened_file:
            return opened_file.describe_fields()

    def get_file_type(self, path):
        with self.inspector(path) as opened_file:
            return opened_file.file_type()


class FileAddView(FormView, ImportHelper):
    form_class = UploadFileForm
    success_url = reverse_lazy('uploads-list')
    template_name = 'importer/new.html'

    def create_upload_session(self, upload_file):
        """
        Creates an upload session from the file.
        """
        upload = UploadedData.objects.create(user=self.request.user, state='UPLOADED', complete=True)
        upload_file.upload = upload
        upload_file.save()
        upload.size = upload_file.file.size
        upload.name = upload_file.name
        upload.file_type = self.get_file_type(upload_file.file.path)
        upload.save()

        description = self.get_fields(upload_file.file.path)

        for layer in description:
            configuration_options = DEFAULT_LAYER_CONFIGURATION.copy()
            configuration_options.update({'index': layer.get('index')})
            upload.uploadlayer_set.add(UploadLayer(name=layer.get('name'),
                                                   fields=layer.get('fields', {}),
                                                   index=layer.get('index'),
                                                   feature_count=layer.get('feature_count'),
                                                   configuration_options=configuration_options))
        upload.save()

    def form_valid(self, form):
        form.save(commit=True)
        self.create_upload_session(form.instance)
        return super(FileAddView, self).form_valid(form)
