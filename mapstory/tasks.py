from geonode.geoserver.helpers import ogc_server_settings
from mapstory.utils import parse_wfst_response, has_exception, error_response, print_exception
import requests
from celery import app

@app.task(name="tasks.append_feature_chunks")
def append_feature_chunks(features, wfst_insert_template,get_features_request,target):
    summary = None
    handle = 'added {0} features to {1} via append'.format(len(features),target)
    wfs_transaction_payload = wfst_insert_template.format(features=''.join(features), workspace='geonode',
                                                          workspace_uri='http://www.geonode.org/', handle=handle)

    insert_features_request = requests.post(
            '{}/wfs/WfsDispatcher'.format(ogc_server_settings.public_url),
            auth=ogc_server_settings.credentials,
            headers={'Content-Type': 'application/xml'},
            data=wfs_transaction_payload
    )
    if has_exception(insert_features_request.content) is False:
        print_exception(insert_features_request.content)
    else:
        summary = parse_wfst_response(insert_features_request.content)


    return summary
