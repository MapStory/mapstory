#!/bin/bash

BAK_DIR=/backups

### Restore volumes
pushd /var/lib/rexray/volumes

# Geoserver
pushd mapstory_geoserver/data
tar -xzf $BAK_DIR/geoserver.tar.gz .
popd

# Mapstory Media
pushd mapstory_mapstory_media/data
tar -xzf $BAK_DIR/mapstory_media.tar.gz .
popd

popd

### Restore Postgres DBs
dco run --rm pgadmin --restore
