from .local_key import *
DATABASE_PASSWORD = '{{ pgpass }}'
OGC_SERVER['default']['PASSWORD'] = '{{ gspass }}'
OGC_SERVER['default']['PUBLIC_LOCATION'] = 'http://{{ nginx_server_name }}/geoserver/'
LOCAL_CONTENT = False