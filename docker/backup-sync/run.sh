#!/bin/sh
set -e

BAK_DIR=/backups
TODAY=$(date -u +'%F')

# MapStory media dir
echo "Copying MapStory media dir"
cd /var/lib/mapstory/media
tar -czf $BAK_DIR/mapstory_media.tar.gz .

# GeoServer data dir
echo "Copying GeoServer data dir"
cd /var/lib/geoserver/data
tar -czf $BAK_DIR/geoserver.tar.gz .

# Copy to S3 bucket for daily backup
echo "Pushing daily to S3"
cd /backups
aws s3 cp --recursive $BAK_DIR s3://mapstory-prod-backup/daily/$TODAY

# Weekly backup (on Sunday)
if [ $(date -u +%w) -eq 0 ]
then
    echo "Pushing weekly to S3"
    aws s3 cp --recursive $BAK_DIR s3://mapstory-prod-backup/weekly/$TODAY
fi

# Monthly backup (on the first)
if [ $(date -u +%d) -eq 01 ]
then
    echo "Pushing monthly to S3"
    aws s3 cp --recursive $BAK_DIR s3://mapstory-prod-backup/monthly/$TODAY
fi
