FROM mapstory/python-gdal
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

ENV MEDIA_ROOT /var/lib/mapstory/media
ENV STATIC_ROOT /var/lib/mapstory/static
ENV APP_PATH /srv
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

# Install WSGI server and paver
RUN set -ex \
    && pip install --no-cache-dir \
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
    && rm -rf /var/lib/apt/lists/*

#RUN mkdir -p $MEDIA_ROOT && chown www-data $MEDIA_ROOT
#RUN mkdir -p $STATIC_ROOT && chown www-data $STATIC_ROOT

### Copy Django app and install python dependencies
RUN adduser --disabled-password --gecos '' mapstory
RUN chown mapstory $APP_PATH
RUN mkdir -p $MEDIA_ROOT && chown mapstory $MEDIA_ROOT
RUN mkdir -p $STATIC_ROOT && chown mapstory $STATIC_ROOT
USER mapstory
WORKDIR $APP_PATH

# Fetch GeoNode
RUN set -ex \
    && wget https://github.com/MapStory/geonode/archive/master.zip \
    && unzip master.zip \
    && mv geonode-master geonode \
    && rm master.zip
RUN sed -i 's/Paver==1.2.1/Paver==1.2.4/' $APP_PATH/geonode/setup.py

WORKDIR $APP_PATH/mapstory
COPY requirements.txt ./
USER root

# Fetch MapLoom
RUN set -ex \
    && wget https://github.com/MapStory/django-maploom/archive/composer.zip \
    && unzip composer.zip \
    && cp -r django-maploom-composer/maploom /usr/local/lib/python2.7/maploom \
    && rm composer.zip
RUN pip install --no-cache-dir -r requirements.txt

# cache these
USER mapstory
WORKDIR $APP_PATH/geonode/geonode/static
RUN set -ex \
    && npm install \
    && bower install
COPY mapstory/static $APP_PATH/mapstory/mapstory/static
RUN set -ex \
    && npm install \
    && bower install
USER root
WORKDIR $APP_PATH/mapstory

#COPY . .
COPY mapstory ./mapstory
COPY docker/django/local_settings.py ./mapstory/settings/
COPY scripts ./scripts
COPY ./*.py ./
RUN pip install --no-deps --no-cache-dir -r requirements.txt
RUN chown -R mapstory:mapstory $APP_PATH/mapstory

USER mapstory
WORKDIR $APP_PATH/geonode/geonode/static
RUN set -ex \
    && npm install \
    && bower install \
    && grunt copy

WORKDIR $APP_PATH/mapstory/mapstory/static
RUN set -ex \
    && npm install \
    && bower install \
    && grunt concat \
    && grunt less \
    && grunt copy

USER root
RUN set -ex \
    && chown -R mapstory:mapstory $STATIC_ROOT \
    && chown -R mapstory:mapstory $MEDIA_ROOT \
    && mkdir -p $APP_PATH/mapstory/cover \
    && chown -R mapstory:mapstory $APP_PATH/mapstory/cover


COPY docker/django/run.sh /opt/

USER mapstory
VOLUME $STATIC_ROOT
VOLUME $MEDIA_ROOT
VOLUME $APP_PATH/mapstory/cover
WORKDIR $APP_PATH/mapstory/
EXPOSE $DJANGO_PORT
ENTRYPOINT ["/opt/run.sh"]
CMD ["--init-db", "--collect-static", "--reindex", "--serve"]
