from celery import app
from geonode.geoserver.helpers import ogc_server_settings
import requests

from mapstory.mapstories.models import MapStory
from mapstory.utils import parse_wfst_response, has_exception, error_response, print_exception


@app.task(name="tasks.append_feature_chunks")
def append_feature_chunks(features, wfst_insert_template,get_features_request,target):
    summary = None
    handle = 'added {0} features to {1} via append'.format(len(features),target)
    wfs_transaction_payload = wfst_insert_template.format(features=''.join(features), workspace='geonode',
                                                          workspace_uri='http://www.geonode.org/', handle=handle)

    insert_features_request = requests.post(
            '{}/wfs/WfsDispatcher'.format(ogc_server_settings.LOCATION),
            auth=ogc_server_settings.credentials,
            headers={'Content-Type': 'application/xml'},
            data=wfs_transaction_payload
    )
    if has_exception(insert_features_request.content) is False:
        print_exception(insert_features_request.content)
    else:
        summary = parse_wfst_response(insert_features_request.content)

    return summary


@app.task(name='tasks.deletion.delete_mapstory', queue='cleanup')
def delete_mapstory(object_id):
    """
    Deletes a mapstory and the associated maps and the associated map layers.
    """

    try:
        map_obj = MapStory.objects.get(id=object_id)
    except MapStory.DoesNotExist:
        return

    chapters = map_obj.chapters
    for chapter in chapters:
        chapter.layer_set.all().delete()
        chapter.delete()

    map_obj.delete()
