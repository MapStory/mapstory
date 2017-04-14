#!/bin/sh
set -e

# Load secrets as environment variables
for secret in /run/secrets/env_*; do
    # Pattern matches with no results are treated as string literals.
    # Verify that the file actually exists.
    [ -f "$secret" ] || continue
    set -a
    . $secret
    set +a
done

# Domains get prepended with a '.' to apply to subdomains.
if [ ! -z "${PUBLIC_HOST##*[!0-9\.]*}" ]; then
    # IP address
    SESSION_COOKIE_DOMAIN=$PUBLIC_HOST
else
    # Domain name
    SESSION_COOKIE_DOMAIN=.$PUBLIC_HOST
fi
GEOSERVER_PROXY_URL=${PUBLIC_PROTOCOL}://${PUBLIC_HOST}/geoserver/

# If the data directory doesn't exist, copy the one embedded in the WAR.
[ ! -e $GEOSERVER_DATA_DIR/global.xml ] && cp -r $WEBAPPS_DIR/geoserver/data/* /var/lib/geoserver/data/

# Remove the data directory embedded in the WAR.
rm -rf $WEBAPPS_DIR/geoserver/data

# Copy in the defaults styles.
mkdir -p $GEOSERVER_DATA_DIR/styles
cp /tmp/styles/* $GEOSERVER_DATA_DIR/styles/

cd /opt
# Resolve the template for the config file so that paths are correct
./consul-template -template "config.hcl:config-new.hcl" -once
# Resolve the rest of the templates and run tomcat
./consul-template -config config-new.hcl -once
