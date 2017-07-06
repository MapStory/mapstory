FROM python:2.7
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

ENV TMP /tmp
ENV GDAL_VERSION 2.2.1

WORKDIR $TMP

### Build and install GDAL
RUN set -ex \
    && wget -qP $TMP http://download.osgeo.org/gdal/$GDAL_VERSION/gdal-$GDAL_VERSION.tar.gz \
    && tar -xf $TMP/gdal-$GDAL_VERSION.tar.gz -C $TMP \
    && cd $TMP/gdal-$GDAL_VERSION \
    && ./configure --with-python \
    && make \
    && make install \
    && ldconfig \
    && cd .. \
    && rm -r gdal* \
    && pip install --no-cache-dir GDAL==$GDAL_VERSION
