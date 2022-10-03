FROM python:3.10.2-buster

ENV MEDIA_ROOT /var/lib/mapstory/media
ENV STATIC_ROOT /var/lib/mapstory/static
ENV APP_PATH /srv/mapstory
ENV TMP /tmp
ENV DJANGO_PORT 8000
ENV PYTHONUNBUFFERED 0
ENV MISSING_THUMBNAIL /static/mapstory/img/missing_thumb.png

WORKDIR $TMP

# Add CA cert for self signing
COPY docker/nginx/ca.crt /usr/local/share/ca-certificates/
COPY docker/nginx/cacerts/Certificates_v5.3_DoD.pem.crt /usr/local/share/ca-certificates/
COPY docker/nginx/cacerts/comodorsacertificationauthority.crt /usr/local/share/ca-certificates/
COPY docker/nginx/cacerts/comodorsadomainvalidationsecureserverca.crt /usr/local/share/ca-certificates/

RUN set -ex \
    && update-ca-certificates

# Install tools
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# To get GDAL 3.2.1 to fix this issue https://github.com/OSGeo/gdal/issues/1692
# TODO: The following line should be removed if base image upgraded to Bullseye
RUN echo "deb http://deb.debian.org/debian/ bullseye main contrib non-free" | tee /etc/apt/sources.list.d/debian.list

# This section is borrowed from the official Django image but adds GDAL and others
RUN apt-get update -y && apt-get upgrade -y

# Prepraing dependencies
RUN apt-get install -y \
    libgdal-dev libpq-dev libxml2-dev \
    libxml2 libxslt1-dev zlib1g-dev libjpeg-dev \
    libmemcached-dev libldap2-dev libsasl2-dev libffi-dev

RUN apt-get install -y --no-install-recommends \
    gcc zip gettext geoip-bin cron \
    postgresql-client-13 \
    sqlite3 spatialite-bin libsqlite3-mod-spatialite \
    python3-all-dev python3-dev \
    python3-gdal python3-psycopg2 python3-ldap \
    python3-pip python3-pil python3-lxml python3-pylibmc \
    uwsgi uwsgi-plugin-python3 \
    firefox-esr

RUN apt-get install -y devscripts build-essential debhelper pkg-kde-tools sharutils
# RUN git clone https://salsa.debian.org/debian-gis-team/proj.git /tmp/proj
# RUN cd /tmp/proj && debuild -i -us -uc -b && dpkg -i ../*.deb

# Install pip packages
RUN pip3 install uwsgi \
    && pip install pip --upgrade \
    && pip install pygdal==$(gdal-config --version).* flower==0.9.4

# Install python tools
RUN set -ex \
    && pip install --no-cache-dir \
        coveralls \
        pycodestyle \
        pylint \
        pylint-django \
        ;

# Install misc libs
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libgeos-dev \
        libjpeg-dev \
        libxml2-dev \
        libgdal-dev \
        libspatialite-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node and related tools
RUN set -ex \
    && curl -sL https://deb.nodesource.com/setup_lts.x | /bin/bash - \
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
        webpack \
    && yarn cache clean \
    && rm -rf /var/lib/apt/lists/*

# Setup user and paths
RUN set -ex \
    && adduser --disabled-password --gecos '' mapstory \
    && mkdir -p $APP_PATH/deps && chown -R mapstory $APP_PATH \
    && mkdir -p $MEDIA_ROOT && chown mapstory $MEDIA_ROOT \
    && mkdir -p $STATIC_ROOT && chown mapstory $STATIC_ROOT

WORKDIR $APP_PATH

# Copy in dependencies
COPY --chown=mapstory:mapstory deps ./deps

# Install dependencies from requirements.txt
COPY --chown=mapstory:mapstory requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY epsg_extra /usr/local/lib/python3.10/dist-packages/pyproj/data/
# The httplib2 python library uses its own CA certificates.
# Add the system and self-signed CAs.
RUN cat /etc/ssl/certs/ca-certificates.crt >> /usr/local/lib/python3.10/site-packages/httplib2/cacerts.txt

# Copy in the code
COPY --chown=mapstory:mapstory mapstory ./mapstory
COPY --chown=mapstory:mapstory ./*.py ./
COPY --chown=mapstory:mapstory docker/django/run.sh $APP_PATH/docker/django/
RUN ln -s $APP_PATH/docker/django/run.sh /opt/run.sh

RUN set -ex \
    && chown -R mapstory:mapstory $STATIC_ROOT \
    && chown -R mapstory:mapstory $MEDIA_ROOT \
    && mkdir -p $APP_PATH/cover \
    && chown -R mapstory:mapstory $APP_PATH/cover

USER mapstory

WORKDIR $APP_PATH/mapstory/static
RUN set -ex \
    && /opt/run.sh --collect-static \
    && yarn cache clean \
    && rm -rf ~/.cache/bower

WORKDIR $APP_PATH
VOLUME $STATIC_ROOT
VOLUME $MEDIA_ROOT
VOLUME $APP_PATH/cover
EXPOSE $DJANGO_PORT
ENTRYPOINT ["/opt/run.sh"]
CMD ["--init-db", "--reindex", "--serve"]
