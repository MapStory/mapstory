
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
* virtualenv OR virtualenvwrapper

Repositories
------------

The full build lives in a 'meta-project' at https://github.com/MapStory/mapstory/tree/mapstory-v2. This is used for stability as the upstream dependent projects are pegged to specific versions. While MapStory has forks of upstream projects, the goal is to support temporary efforts that are intended for eventual merging into the respective projects. The forks' will be updated as needed.

For a local developer build, clone the following repositories as siblings of each other:
* https://github.com/MapStory/MapLoom
* https://github.com/GeoNode/geonode
* https://github.com/MapStory/geoserver-geonode-ext
* https://github.com/MapStory/mapstory-geonode
* https://github.com/ischneider/geotools (optional - only needed for extended datetime support)

Setup
-----

Follow installation instructions in GeoNode for the relevant operating system.
*STOP* when you reach the point of running `pip install -e geonode`

Make virtualenv for mapstory, activate it, change directory to `mapstory-geonode` and run:

    pip install -r requirements.txt

Many paver tasks are reused from GeoNode. They should be run in the `mapstory-geonode` directory to work properly.

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

By default, this will bind to localhost but if you need to bind to another interface (like when running in a headless VM and accessing on a host-only network), you can use the `--bind` option:

    paver start_django --bind=192.168.56.100

MapStory should be available at this point on port 8000.
