from geonode.geoserver.helpers import ogc_server_settings
from mapstory.utils import parse_wfst_response, has_exception, error_response
from httplib import INTERNAL_SERVER_ERROR
import requests
from celery import app

@app.task(name="tasks.append_feature_chunks")
def append_feature_chunks(features, wfst_insert_template,get_features_request):
    summary_aggregated = {}
    wfs_transaction_payload = wfst_insert_template.format(features=''.join(features), workspace='geonode',
                                                                  workspace_uri='http://www.geonode.org/')
    insert_features_request = requests.post(
            '{}/wfs/WfsDispatcher'.format(ogc_server_settings.public_url),
            auth=ogc_server_settings.credentials,
            headers={'Content-Type': 'application/xml'},
            data=wfs_transaction_payload
    )
    summary = parse_wfst_response(insert_features_request.content)
    for s in summary:
        if s in summary_aggregated:
            summary_aggregated[s] += int(summary[s])
        else:
            summary_aggregated[s] = int(summary[s])

    if has_exception(get_features_request.content):
        return error_response(INTERNAL_SERVER_ERROR, get_features_request.content)

    return summary_aggregated
