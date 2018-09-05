#!/bin/sh

set -ex

# Backup Postgres DBs
dco run --rm pgadmin --dump

# Backup shared volumes and push to S3
dco up backup-sync
