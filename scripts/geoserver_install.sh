#!/bin/bash
set -e

sudo apt-get -qq -y update
# geoserver
#sudo apt-get install -y --force-yes openjdk-7-jdk --no-install-recommends
#sudo apt-get install -y unzip
mkdir -p gs
pushd gs
wget http://repo2.maven.org/maven2/org/mortbay/jetty/jetty-runner/8.1.8.v20121106/jetty-runner-8.1.8.v20121106.jar
wget http://ares.boundlessgeo.com/geoserver/2.9.x/geoserver-2.9.x-latest-war.zip
chmod +x jetty-runner-8.1.8.v20121106.jar
unzip -o geoserver-2.9.x-latest-war.zip -d .
popd
sudo apt-get update -qq

wget https://s3.amazonaws.com/django-osgeo-importer/gdal-2.2.0-linux-bin.tar.gz
sudo tar --directory=/usr/local/lib -xvf gdal-2.2.0-linux-bin.tar.gz
sudo mv /usr/local/lib/gdal-2.2.0-linux-bin /usr/local/lib/gdal
export PATH=/usr/local/lib/gdal/bin:$PATH
sudo touch /usr/lib/python2.7/dist-packages/gdal.pth
sudo su -c  "echo '/usr/local/lib/gdal/lib/python2.7/site-packages' > /usr/lib/python2.7/dist-packages/gdal.pth"
sudo su -c "echo '/usr/local/lib/gdal/lib/' >> /etc/ld.so.conf"
sudo ldconfig
sudo touch /etc/profile.d/gdal
sudo su -c "echo 'export GDAL_DATA=/usr/local/lib/gdal/share/gdal/'" >> /etc/profile.d/gdal.sh

#if [ "$TRAVIS" = true ];
#then
#   sudo apt-get -y --no-install-recommends --force-yes install libgdal1 postgresql-9.3-postgis-2.3
#else
#   sudo add-apt-repository "deb https://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main"
#   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
#   sudo apt-get update
#   sudo apt-get -y install postgresql-9.3-postgis-2.3
#fi

#sudo apt-get install -y python-dev python-lxml libxslt1-dev libpq-dev
#sudo apt-get install -y python-virtualenv python-imaging python-pyproj libgeos-3.4.2 libgeos-dev python-shapely python-nose python-httplib2 python-httplib2 gettext git
#sudo apt-get install -y libproj0 libproj-dev postgresql-plpython-9.3 python-numpy python-dateutil libjpeg62 zlib1g-dev python-dev libxml2 libxml2-dev libxslt1-dev libpq-dev

#install libraries for a stacked out gdal
#sudo apt-get install -y sqlite3 libsqlite3-0 libsqlite3-dev libspatialite5 libspatialite-dev libcurl4-gnutls-dev libxerces-c-dev
#sudo apt-get install -y gpsbabel libfreexl-dev unixodbc-dev libwebp-dev libjpeg-dev libpng12-dev libgif-dev liblzma-dev
#sudo apt-get install -y libcrypto++-dev netcdf-bin libnetcdf-dev libexpat-dev

if [ -n "$1" ]
 then
 cd $1
fi

# Python packages, requirements & additional development requirements
#pip install -r requirements.txt
#pip install -r requirements.dev.txt

#sudo mkdir -p -m 777 importer-test-files
#aws --no-sign-request s3 sync s3://mapstory-data/importer-test-files/ importer-test-files

# Add additional EPSG Codes
#if [ "$TRAVIS" = "true" ];
#then
#   sudo cp scripts/epsg_extra $HOME/virtualenv/python2.7_with_system_site_packages/local/lib/python2.7/site-packages/pyproj/data/
#else
#   sudo cp scripts/epsg_extra /usr/local/lib/python2.7/dist-packages/pyproj/data/
#fi