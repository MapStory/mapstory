#!/bin/sh
set -ex

# If DCO is not set, assign it 'docker-compose'
: ${DCO:='docker-compose'}

$DCO pull elasticsearch geoserver
$DCO build --pull --no-cache \
    composer \
    django \
    pgadmin \
    rabbitmq \
    ;
# nginx depends on other containers, so '--pull --no-cache' doesn't work properly
docker pull nginx:1.15-alpine
$DCO build nginx

# build any other containers needed in this config
$DCO build
