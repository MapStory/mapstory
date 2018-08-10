#!/bin/bash

BAK_DIR=/home/admin/backups

### Backup volumes
pushd /var/lib/rexray/volumes

# Geoserver
pushd mapstory_geoserver/data
tar -czf $BAK_DIR/geoserver.tar.gz data
popd

# Mapstory Media
pushd mapstory_mapstory_media/data
tar -czf $BAK_DIR/mapstory_media.tar.gz *
popd

popd

### Backups Postgres DBs
dco run --rm -v $BAK_DIR:/backups pgadmin --dump
