#!/bin/bash

#set -e

# build geonode static for developer mode
cd /srv/git/geonode
paver static

cd /srv/git/mapstory-geonode
. /usr/share/virtualenvwrapper/virtualenvwrapper.sh

# this can fail due to wsgi file locking
if [ ! -e ~/.virtualenvs/mapstory ]; then
    mkvirtualenv -a /srv/git/mapstory-geonode --system-site-packages mapstory
fi

# activate venv
workon mapstory

# install geonode + deps
pip install --download-cache ~/.pip-cache -e ../geonode

# @todo extract to separate task
paver setup sync