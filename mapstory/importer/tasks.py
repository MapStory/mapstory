import os
import shutil
from .importers import GDALImport
from .models import UploadFile, UploadLayer
from celery.task import task
from geonode.layers.models import Layer


@task
def import_object(upload_file_id, configuration_options):
    """
    Imports a file into GeoNode.

    :param configuration_options: List of configuration objects for each layer that is being imported.
    """

    upload_file = UploadFile.objects.get(id=upload_file_id)

    gi = GDALImport(upload_file.file.path)
    layers = gi.handle(configuration_options=configuration_options)
    for layer, config in layers:
        try:
            matched_layer = Layer.objects.get(name=layer)
            UploadLayer.objects.filter(upload=upload_file.upload, index=config.get('index')).update(layer=matched_layer)
        except Layer.DoesNotExist:
            pass
        except UploadLayer.DoesNotExist:
            pass

    return layers


@task
def remove_path(path):
    """
    Removes a path using shutil.rmtree.
    """
    if os.path.exists(path):
        shutil.rmtree(path)
