ARG TAG=master
FROM quay.io/mapstory/composer:$TAG AS composer

# Moves npm_modules dirs to the correct locations
RUN ./scripts/run.sh --no-op

# Clear out unused files and dirs
RUN rm -r \
        LICENSE \
        deps \
        karma* \
        webpack* \
        yarn* \
        ;


FROM quay.io/mapstory/django:$TAG AS django
# Used for static django files


FROM nginx:1.15-alpine
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

### Env vars and their defaults:
# DEV_DEPLOYMENT=False
# NGINX_NUM_WORKERS=1
# NGINX_FILE_CACHE_ENABLED=False
# NGINX_GZIP_COMP_LEVEL=4
# NGINX_CLIENT_MAX_BODY_SIZE=500m
# FORCE_HTTPS_REDIRECT=True
# PUBLIC_HOST
# PUBLIC_PROTOCOL
# SSL_CERT
# SSL_KEY

ENV MEDIA_ROOT=/var/lib/mapstory/media
ENV COMPOSER_ROOT=/srv/composer
ENV DJANGO_STATIC_ROOT=/var/lib/mapstory/static
ENV CONSUL_TEMPLATE_VERSION=0.18.1

VOLUME $MEDIA_ROOT

# Install tools and openssl/cert support
RUN apk --no-cache add \
    ca-certificates \
    wget

# Install consul-template
RUN set -ex \
    && mkdir -p /opt \
    && wget -qO /opt/consul-template.tgz https://releases.hashicorp.com/consul-template/$CONSUL_TEMPLATE_VERSION/consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.tgz \
    && tar xf /opt/consul-template.tgz -C /opt/ consul-template \
    && rm /opt/consul-template.tgz

COPY docker.crt /etc/nginx/
COPY docker.key /etc/nginx/

COPY config.hcl /opt/
COPY templates/ /opt/templates

COPY run.sh /opt/

COPY --from=django $DJANGO_STATIC_ROOT $DJANGO_STATIC_ROOT
COPY --from=composer /srv/story-tools-composer $COMPOSER_ROOT

CMD /opt/run.sh
