#!/bin/bash -i
# Interactive mode bash is used so that the alias "dco" functions properly.

set -ex

BAK_DIR=/backups

cd /home/admin/mapstory # Expects to be run on the prod deployment

sudo rm -r $BAK_DIR/*

# Backup Postgres DBs
dco run --rm pgadmin --dump

# Backup shared volumes and push to S3
dco up backup-sync
