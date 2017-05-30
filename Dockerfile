FROM mapstory/python-gdal
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

ENV MEDIA_ROOT /var/lib/mapstory/media
ENV STATIC_ROOT /var/lib/mapstory/static
ENV APP_PATH /srv/mapstory
ENV TMP /tmp
ENV DJANGO_PORT 8000

WORKDIR $TMP

# Add CA cert for self signing
COPY docker/nginx/ca.crt /usr/local/share/ca-certificates/
RUN set -ex \
    && update-ca-certificates

# Install tools
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Install WSGI server and python tools
RUN set -ex \
    && pip install --no-cache-dir \
        coveralls \
        gunicorn \
        paver

# Install misc libs
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgeos-dev \
        libjpeg-dev \
        libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node and related tools
RUN set -ex \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        nodejs \
    && npm install -g bower grunt \
    && rm -rf ~/.npm \
    && rm -rf /tmp/npm-* \
    && rm -rf /var/lib/apt/lists/*

#RUN mkdir -p $MEDIA_ROOT && chown www-data $MEDIA_ROOT
#RUN mkdir -p $STATIC_ROOT && chown www-data $STATIC_ROOT

# Setup user and paths
RUN set -ex \
    && adduser --disabled-password --gecos '' mapstory \
    && mkdir -p $APP_PATH/deps && chown -R mapstory $APP_PATH \
    && mkdir -p $MEDIA_ROOT && chown mapstory $MEDIA_ROOT \
    && mkdir -p $STATIC_ROOT && chown mapstory $STATIC_ROOT

# Clone submodules temporarily. They're needed for the install.
# These will be overwrriten when we load the code volume.
# We don't use COPY because it will force rebuilds on any changes.
#USER mapstory
WORKDIR $APP_PATH/deps
RUN set -ex \
    && git clone -b 2.6 --depth 1 https://github.com/GeoNode/geonode.git \
    && sed -i 's/Paver==1.2.1/Paver==1.2.4/' ./geonode/setup.py \
    && pip install -e ./geonode \
    && git clone -b composer --depth 1 https://github.com/MapStory/django-maploom.git \
    && pip install -e ./django-maploom \
    && git clone -b master --depth 1 https://github.com/pinax/django-mailer.git \
    && pip install -e ./django-mailer \
    && git clone -b master --depth 1 https://github.com/MapStory/icon-commons.git \
    && pip install -e ./icon-commons \
    && git clone -b v0.2.1 --depth 1 https://github.com/GeoNode/django-osgeo-importer.git \
    && pip install -e ./django-osgeo-importer \
    && chown -R mapstory:mapstory .

# Install dependencies from requirements.txt
WORKDIR $APP_PATH
COPY requirements.txt ./
#USER root
RUN pip install --no-cache-dir -r requirements.txt

# Cache these. Hopefully it will speed up the later steps.
# USER mapstory
# WORKDIR $APP_PATH/deps/geonode/geonode/static
# RUN set -ex \
#     && npm install \
#     && rm -rf ~/.npm \
#     && rm -rf /tmp/npm-* \
#     && bower install \
#     && rm -rf ~/.cache/bower
COPY mapstory/static $APP_PATH/mapstory/static
WORKDIR $APP_PATH/mapstory/static
RUN chown -R mapstory:mapstory .
USER mapstory
RUN set -ex \
    && npm install \
    && rm -rf ~/.npm \
    && rm -rf /tmp/npm-* \
    && bower install \
    && rm -rf ~/.cache/bower
USER root
WORKDIR $APP_PATH

#COPY . .
COPY mapstory ./mapstory
#COPY docker/django/local_settings.py ./mapstory/settings/
COPY ./*.py ./
RUN chown -R mapstory:mapstory $APP_PATH

USER mapstory
# WORKDIR $APP_PATH/deps/geonode/geonode/static
# RUN set -ex \
#     && npm install \
#     && rm -rf ~/.npm \
#     && rm -rf /tmp/npm-* \
#     && bower install \
#     && rm -rf ~/.cache/bower \
#     && grunt copy

WORKDIR $APP_PATH/mapstory/static
RUN set -ex \
    && npm install \
    && bower install \
    && grunt concat \
    && grunt less:development \
    && grunt copy:development \
    && rm -rf ~/.npm \
    && rm -rf /tmp/npm-* \
    && rm -rf ~/.cache/bower \
    && rm -rf /tmp/phantomjs

USER root
RUN set -ex \
    && chown -R mapstory:mapstory $STATIC_ROOT \
    && chown -R mapstory:mapstory $MEDIA_ROOT \
    && mkdir -p $APP_PATH/cover \
    && chown -R mapstory:mapstory $APP_PATH/cover \
    && mkdir -p /usr/local/lib/python2.7/site-packages-copy \
    && chown -R mapstory:mapstory /usr/local/lib/python2.7/site-packages-copy

COPY scripts ./scripts
COPY docker/django/run.sh /opt/

USER mapstory
VOLUME $STATIC_ROOT
VOLUME $MEDIA_ROOT
VOLUME $APP_PATH/cover
WORKDIR $APP_PATH
EXPOSE $DJANGO_PORT
ENTRYPOINT ["/opt/run.sh"]
CMD ["--collect-static", "--init-db", "--reindex", "--serve"]
