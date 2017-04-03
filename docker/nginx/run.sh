#/bin/sh
if [ -e /run/secrets/ssl_cert ]; then
    export SSL_CERT=/run/secrets/ssl_cert
    export SSL_KEY=/run/secrets/ssl_key
else
    export SSL_CERT=/etc/nginx/self_signed.crt
    export SSL_KEY=/etc/nginx/self_signed.key
fi
export ALLOWED_HOSTS="$PUBLIC_HOST|nginx|geoserver|django|celery"
/opt/consul-template -config /opt/config.hcl -once
