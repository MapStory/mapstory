#!/bin/bash

BAK_DIR=/home/admin/backups

### Restore volumes
pushd /var/lib/rexray/volumes

# Geoserver
pushd mapstory_geoserver/data
tar -xvf $BAK_DIR/geoserver.tar data
popd

# Mapstory Media
pushd mapstory_mapstory_media/data
tar -xvf $BAK_DIR/mapstory_media.tar .
popd

popd

### Restore Postgres DBs
dco run --rm -v $BAK_DIR:/backups pgadmin --restore
