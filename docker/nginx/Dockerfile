FROM nginx
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

ENV MEDIA_ROOT=/var/lib/mapstory/media/
ENV STATIC_ROOT=/var/lib/mapstory/static/
ENV NGINX_CLIENT_MAX_BODY_SIZE=500m

### Hardcoded settings.
### These should be templated in the config file.
# MEDIA_ROOT
# STATIC_ROOT
# NGINX_CLIENT_MAX_BODY_SIZE

#VOLUME $MEDIA_ROOT
COPY nginx.conf /etc/nginx/nginx.conf
