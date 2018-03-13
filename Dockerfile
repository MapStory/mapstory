FROM quay.io/mapstory/python-gdal:2.7.x-2.2.x
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

ENV MEDIA_ROOT /var/lib/mapstory/media
ENV STATIC_ROOT /var/lib/mapstory/static
ENV APP_PATH /srv/mapstory
ENV TMP /tmp
ENV DJANGO_PORT 8000
ENV PYTHONUNBUFFERED 0

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
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libgeos-dev \
        libjpeg-dev \
        libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install phantomjs
ENV QT_QPA_PLATFORM minimal
RUN set -ex \
    && echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        phantomjs \
    && rm -rf /var/lib/apt/lists/*

# Install Node and related tools
RUN set -ex \
    && curl -sL https://deb.nodesource.com/setup_6.x | /bin/bash - \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        nodejs \
        yarn \
    && yarn global add \
        bower \
        grunt \
        gulp-cli \
        webpack@^3.10.0 \
    && yarn cache clean \
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
    && git clone -b 2.6.x --depth 1 https://github.com/GeoNode/geonode.git \
    && sed -i 's/Paver==1.2.1/Paver==1.2.4/' ./geonode/setup.py \
    && pip install -e ./geonode \
    && git clone -b feature/composer-wip --depth 1 https://github.com/MapStory/maploom.git \
    && git clone -b composer --depth 1 https://github.com/MapStory/django-maploom.git \
    && pip install -e ./django-maploom \
    && git clone -b master --depth 1 https://github.com/pinax/django-mailer.git \
    && pip install -e ./django-mailer \
    && git clone -b master --depth 1 https://github.com/MapStory/icon-commons.git \
    && pip install -e ./icon-commons \
    && git clone -b angular-1.6 --depth 1 https://github.com/GeoNode/django-osgeo-importer.git \
    && pip install -e ./django-osgeo-importer \
    && git clone -b master --depth 1 https://github.com/MapStory/story-tools.git \
    && git clone -b master --depth 1 https://github.com/MapStory/story-tools-composer.git \
    && chown -R mapstory:mapstory .

# Install dependencies from requirements.txt
WORKDIR $APP_PATH
COPY requirements.txt ./
#USER root
RUN pip install --no-cache-dir -r requirements.txt
COPY epsg_extra /usr/local/lib/python2.7/dist-packages/pyproj/data/
# The httplib2 python library uses its own CA certificates.
# Add the system and self-signed CAs.
RUN cat /etc/ssl/certs/ca-certificates.crt >> /usr/local/lib/python2.7/site-packages/httplib2/cacerts.txt

# Override the version of awesome-slugify
# Using HEAD as of 2018-01-09
# The version isn't changed, so it has trouble differentiation from the version in pypy. Thus this manual update.
RUN pip install --no-cache-dir -U git+git://github.com/dimka665/awesome-slugify@a6563949965bcddd976b7b3fb0babf76e3b490f7#egg=awesome-slugify

# Cache these. Hopefully it will speed up the later steps.
COPY --chown=mapstory:mapstory mapstory/static $APP_PATH/mapstory/static
WORKDIR $APP_PATH/mapstory/static
RUN chown -R mapstory:mapstory .
USER mapstory
RUN set -ex \
    && yarn install \
    && yarn cache clean \
    && bower install \
    && rm -rf ~/.cache/bower
WORKDIR $APP_PATH/deps/story-tools-composer
RUN set -ex \
    && yarn install \
    && webpack --output-public-path='/static/composer/' \
    && cp -r . $APP_PATH/mapstory/static/composer \
    && yarn cache clean \
    && rm -rf /tmp/phantomjs

USER root
WORKDIR $APP_PATH

# Copy in dependencies
COPY --chown=mapstory:mapstory deps ./deps
# Copy in the code
COPY --chown=mapstory:mapstory mapstory ./mapstory
COPY --chown=mapstory:mapstory ./*.py ./
RUN chown -R mapstory:mapstory $APP_PATH

USER mapstory

WORKDIR $APP_PATH/mapstory/static
RUN set -ex \
    && yarn install \
    && bower install \
    && grunt concat \
    && grunt less:development \
    && grunt copy:development \
    && yarn cache clean \
    && rm -rf ~/.cache/bower \
    && rm -rf /tmp/phantomjs

WORKDIR $APP_PATH/deps/story-tools-composer
RUN set -ex \
    && ./scripts/run.sh --bundle \
    && mkdir /tmp/story-tools-composer/ \
    && mv ./node_modules /tmp/story-tools-composer/ \
    && mkdir /tmp/story-tools/ \
    && mv ./deps/story-tools/node_modules /tmp/story-tools/ \
    && rm -rf $APP_PATH/mapstory/static/composer \
    && cp -r . $APP_PATH/mapstory/static/composer \
    && yarn cache clean \
    && rm -rf /tmp/phantomjs

USER root
RUN set -ex \
    && chown -R mapstory:mapstory $STATIC_ROOT \
    && chown -R mapstory:mapstory $MEDIA_ROOT \
    && mkdir -p $APP_PATH/cover \
    && chown -R mapstory:mapstory $APP_PATH/cover \
    && mkdir -p /usr/local/lib/python2.7/site-packages-copy \
    && chown -R mapstory:mapstory /usr/local/lib/python2.7/site-packages-copy

COPY --chown=mapstory:mapstory docker/django/run.sh $APP_PATH/docker/django/
RUN ln -s $APP_PATH/docker/django/run.sh /opt/run.sh

USER mapstory
VOLUME $STATIC_ROOT
VOLUME $MEDIA_ROOT
VOLUME $APP_PATH/cover
WORKDIR $APP_PATH
EXPOSE $DJANGO_PORT
ENTRYPOINT ["/opt/run.sh"]
CMD ["--collect-static", "--init-db", "--reindex", "--serve"]
