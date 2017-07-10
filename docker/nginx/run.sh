#/bin/sh

# Fallback to self signed cert if a real one doesn't exist
if [ -e /run/secrets/ssl_cert ]; then
    export SSL_CERT=/run/secrets/ssl_cert
    export SSL_KEY=/run/secrets/ssl_key
else
    export SSL_CERT=/etc/nginx/docker.crt
    export SSL_KEY=/etc/nginx/docker.key
fi

export ALLOWED_HOSTS="$PUBLIC_HOST|$ALLOWED_HOSTS"

/opt/consul-template -config /opt/config.hcl -once
