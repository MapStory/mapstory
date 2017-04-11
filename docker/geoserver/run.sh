#!/bin/sh
set -ex

if [ ! -z "${PUBLIC_HOST##*[!0-9\.]*}" ]; then
    # IP address
    SESSION_COOKIE_DOMAIN=$PUBLIC_HOST
else
    # Domain name
    SESSION_COOKIE_DOMAIN=.$PUBLIC_HOST
fi
GEOSERVER_PROXY_URL=${PUBLIC_PROTOCOL}://${PUBLIC_HOST}/geoserver/

echo "Starting"
[ ! -e $GEOSERVER_DATA_DIR/global.xml ] && cp -r $WEBAPPS_DIR/geoserver/data/* /var/lib/geoserver/data/
echo "done copying data dir"

rm -rf $WEBAPPS_DIR/geoserver/data

mkdir -p $GEOSERVER_DATA_DIR/styles
cp /tmp/styles/* $GEOSERVER_DATA_DIR/styles/

cd /opt
# Resolve the template for the config file so that paths are correct
./consul-template -template "config.hcl:config-new.hcl" -once
# Resolve the rest of the templates and run tomcat
./consul-template -config config-new.hcl -once
