
mapstory-geonode
================

**PROVISIONAL SETUP INSTRUCTIONS**

Checkout geonode, mapstory-geonode, MapLoom, django-maploom as siblings to each other.
This directory will be referred to as the `root`.

Follow the instructions in MapLoom to build and ensure artifacts in the `build`
directory. To enable `development` mode for MapLoom, cd to the `root` and run:

    ln -s $(pwd)/MapLoom/build mapstory-geonode/mapstory/static/maploom
    mkdir -p mapstory-geonode/mapstory/templates/maps
    ln -s $(pwd)/MapLoom/build/maploom.html mapstory-geonode/mapstory/templates/maps

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

Then start:

    paver start_geoserver paste
