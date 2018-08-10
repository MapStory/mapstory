#!/bin/bash

BAK_DIR=/home/admin/backups

### Restore volumes
pushd /var/lib/rexray/volumes

# Geoserver
pushd mapstory_geoserver/data
tar -xzf $BAK_DIR/geoserver.tar.gz data
popd

# Mapstory Media
pushd mapstory_mapstory_media/data
tar -xzf $BAK_DIR/mapstory_media.tar.gz .
popd

popd

### Restore Postgres DBs
dco run --rm -v $BAK_DIR:/backups pgadmin --restore
