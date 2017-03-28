#!/bin/bash

sudo -u postgres psql -c "create user osgeo with password 'osgeo';"
sudo -u postgres psql -c "create database osgeo_importer_test owner osgeo;"
sudo -u postgres psql -d osgeo_importer_test -c "create extension postgis"
sudo -u postgres psql -d osgeo_importer_test -c "alter user osgeo superuser"

if [ -n "$1" ]
 then
 pushd $1
fi


if [ -f "/vagrant/src/geonode/geonode/development.db" ]
 then
 rm /vagrant/src/geonode/geonode/development.db
fi

echo $DJANGO_SETTINGS_MODULE
python manage.py syncdb --noinput

echo 'Starting Geonode'
python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &

if [ -n "$1" ]
 then
 popd
fi

echo 'Starting Geoserver'
java -Xmx512m -XX:MaxPermSize=256m -Dorg.eclipse.jetty.server.webapp.parentLoaderPriority=true -jar gs/jetty-runner-8.1.8.v20121106.jar --path /geoserver gs/geoserver.war > /dev/null 2>&1 &
sleep 100