#!/bin/bash
set -e
. /home/mapstory/.virtualenvs/mapstory/bin/activate
cd /srv/git/mapstory-geonode
exec python /usr/bin/gunicorn --pythonpath=. --workers=2 --bind=localhost:8000  --log-level=error mapstory.wsgi