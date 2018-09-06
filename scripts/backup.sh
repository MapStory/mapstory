#!/bin/bash -i
# Interactive mode bash is used so that the alias "dco" functions properly.

set -ex

cd /home/admin/mapstory # Expects to be run on the prod deployment

# Backup Postgres DBs
dco run --rm pgadmin --dump

# Backup shared volumes and push to S3
dco up backup-sync
