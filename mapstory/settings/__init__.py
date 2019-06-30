from mapstory.settings.base import *

import glob, inspect, os, osgeo

GEOS_LIBRARY_PATH = glob.glob("{}".format(os.path.join(
    os.path.dirname(inspect.getfile(osgeo)), '.libs/libgeos_c*')))[0]

GDAL_LIBRARY_PATH = glob.glob("{}".format(os.path.join(
    os.path.dirname(inspect.getfile(osgeo)), '.libs/libgdal*')))[0]