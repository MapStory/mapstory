from .local_key import *
MEDIA_ROOT = '{{media_root}}'
DATABASE_PASSWORD = '{{ pgpass }}'
OGC_SERVER['default']['PASSWORD'] = '{{ gspass }}'
OGC_SERVER['default']['PUBLIC_LOCATION'] = 'http://{{ nginx_server_name }}/geoserver/'
LOCAL_CONTENT = False