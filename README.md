
mapstory-geonode
================

**PROVISIONAL SETUP INSTRUCTIONS**

Prerequisites:
* git
* node
* grunt
* bower
* python-2.7
* python-paste

Checkout geonode, mapstory-geonode, MapLoom, django-maploom as siblings to each other.
This directory will be referred to as the `root`.

Follow installation instructions in GeoNode for the relevant operating system.
*STOP* when you reach the point of running `pip install -e geonode`

Make virtualenv for mapstory and change directory to `mapstory-geonode` and run:

    pip install -e ../geonode
    pip install -e ../django-maploom
    pip install PasteDeploy
    pip install dj.paste

The paver tasks are reused from GeoNode. They should be run in the `mapstory-geonode`
directory. The only difference is the `paste` task that runs a small web server
that proxies /geoserver to avoid cross-domain issues.

To setup from an initially clean state:

    paver setup sync static

Then start geoserver and django/grunt:

    paver start

Django/grunt will run in the foreground and can be stopped with ctrl-c but
geoserver will run in the background and can be stopped with:

    paver stop_geoserver

