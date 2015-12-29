#!/bin/bash

#set -e

cd /srv/git/mapstory/mapstory-geonode
. /usr/share/virtualenvwrapper/virtualenvwrapper.sh

# this can fail due to wsgi file locking
if [ ! -e ~/.virtualenvs/mapstory ]; then
    mkvirtualenv -a /srv/git/mapstory/mapstory-geonode --system-site-packages mapstory
fi
