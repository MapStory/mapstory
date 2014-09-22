
mapstory-geonode
================

**PROVISIONAL MANUAL SETUP INSTRUCTIONS**

Assuming Ubuntu 14.04

Prerequisites:
* git
* node
* grunt
* bower
* python-2.7
* python-paste

Checkout the meta-project at https://github.com/MapStory/mapstory/tree/mapstory-v2 or each dependency separately. If checking out seperately, ensure all top submodules are siblings. The parent of all the submodule directories will be referred to as the `root`.

Follow installation instructions in GeoNode for the relevant operating system.
*STOP* when you reach the point of running `pip install -e geonode`

Make virtualenv for mapstory and change directory to `mapstory-geonode` and run:

    pip install -r requirements.txt

Many paver tasks are reused from GeoNode. They should be run in the `mapstory-geonode`
directory.

Important Tasks
===============

To setup from an initially clean state:

    paver setup sync static

Then start geoserver and django/grunt:

    paver start

Django/grunt will run in the foreground and can be stopped with ctrl-c but
geoserver will run in the background and can be stopped with:

    paver stop_geoserver


To run django/grunt alone:

    paver start_django

