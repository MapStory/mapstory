#!/bin/bash

BAK_DIR=/home/admin/backups

### Backup volumes
pushd /var/lib/rexray/volumes

# Geoserver
pushd mapstory_geoserver/data
tar -cvf $BAK_DIR/geoserver.tar data
popd

# Mapstory Media
pushd mapstory_mapstory_media/data
tar -cvf $BAK_DIR/mapstory_media.tar *
popd

popd

### Backups Postgres DBs
dco run --rm -v $BAK_DIR:/backups pgadmin --dump
