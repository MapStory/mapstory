
mapstory
================

[![Build Status](https://travis-ci.org/MapStory/mapstory.svg)](https://travis-ci.org/MapStory/mapstory)

**PROVISIONAL MANUAL SETUP INSTRUCTIONS**

Assuming Ubuntu 14.04

Prerequisites:
* git
* node
* grunt
* bower
* python-2.7
* python-paste
* python-pastescript
* virtualenv OR virtualenvwrapper

Setup
-----

Follow installation instructions in GeoNode for the relevant operating system.
*STOP* when you reach the point of running `pip install -e geonode`

Make virtualenv for mapstory, activate it, change directory to `mapstory` and run:

    pip install -r requirements.txt
    
*NOTE*: while it is safer (to avoid conflicts with other packages and keep dependencies isolated) to create your virtualenv using the default mode of ignoring site-packages, this may result in more requirements being installed by pip. It is possible to use the virtualenv flag `--system-site-packages` if you run into issues.

Now, change directory to `MapLoom` and bootstrap:

    bower install
    npm install
    grunt copy

Important Tasks
===============

Many paver tasks are reused from GeoNode. They should be run in the `mapstory` directory to work properly.

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
