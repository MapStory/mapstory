import os
import ogr
import gdal
import re
import sys
import tempfile
import logging
from csv import DictReader
from cStringIO import StringIO
from django.template import Context, Template
from geoserver.support import DimensionInfo
from dateutil.parser import parse
from django.conf import settings
from django.utils.module_loading import import_by_path

logger = logging.getLogger(__name__)

ogr.UseExceptions()

GDAL_GEOMETRY_TYPES = {
   0: 'Unknown',
   1: 'Point',
   2: 'LineString',
   3: 'Polygon',
   4: 'MultiPoint',
   5: 'MultiLineString',
   6: 'MultiPolygon',
   7: 'GeometryCollection',
   100: 'None',
   101: 'LinearRing',
   1 + -2147483648: 'Point',
   2 + -2147483648: 'LineString',
   3 + -2147483648: 'Polygon',
   4 + -2147483648: 'MultiPoint',
   5 + -2147483648: 'MultiLineString',
   6 + -2147483648: 'MultiPolygon',
   7 + -2147483648: 'GeometryCollection',
   }


BASE_VRT = '''
<OGRVRTDataSource>
    <OGRVRTLayer name="{{name}}">
        <SrcDataSource>{{file}}</SrcDataSource>
        <GeometryType>wkbUnknown</GeometryType>
        <GeometryField encoding="{{enc}}" {{encopt|safe}} />
    </OGRVRTLayer>
</OGRVRTDataSource>'''


def configure_time(resource, name='time', enabled=True, presentation='LIST', resolution=None, units=None,
                   unitSymbol=None, **kwargs):
    """
    Configures time on a geoserver resource.
    """
    time_info = DimensionInfo(name, enabled, presentation, resolution, units, unitSymbol, **kwargs)
    resource.metadata = {'time': time_info}
    return resource.catalog.save(resource)


def ensure_defaults(layer):
    """
    Sets a geoserver feature type defaults.
    """
    if not layer.resource.projection:
        fs = layer.resource
        fs.dirty['srs'] = 'EPSG:4326'
        fs.dirty['projectionPolicy'] = 'FORCE_DECLARED'
        layer.resource.catalog.save(fs)


def create_vrt(file_path):
    """
    Creates a VRT file.
    """

    geo = {}
    headers = None

    with open(file_path) as csv_file:
            headers = DictReader(csv_file, dialect='excel').fieldnames

    for header in headers:
        if re.search(r'\b(lat|latitude|y)\b', header.lower()):
            geo['y'] = header

        if re.search(r'\b(lon|long|longitude|x)\b', header.lower()):
            geo['x'] = header

        if re.search(r'\b(geom|thegeom)\b', header.lower()):
            geo['geom'] = header

    context = {
        'file': file_path,
        'name': os.path.basename(file_path).replace('.csv', ''),
        'enc': 'PointFromColumns',
        'encopt': 'x="{0}" y="{1}"'.format(geo.get('x'), geo.get('y'))
    }

    if geo.get('geom'):
        context['encoding'] = 'WKT'
        context['encopt'] = 'field="{0}"'.format(geo.geom)

    vrtData = Context(context)
    template = Template(BASE_VRT)
    temp_file = tempfile.NamedTemporaryFile(suffix='.vrt')
    temp_file.write(template.render(vrtData))
    temp_file.seek(0)
    return temp_file


class StdOutCapture(list):
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        sys.stdout = self._stdout


class GdalErrorHandler(object):
    def __init__(self):
        self.err_level = gdal.CE_None
        self.err_no = 0
        self.err_msg = ''

    def handler(self, err_level, err_no, err_msg):
        self.err_level = err_level
        self.err_no = err_no
        self.err_msg = err_msg

lastNum = re.compile(r'(?:[^\d]*(\d+)[^\d]*)+')


def increment(s):
    """ look for the last sequence of number(s) in a string and increment """
    m = lastNum.search(s)
    if m:
        next = str(int(m.group(1))+1)
        start, end = m.span(1)
        s = s[:max(end-len(next), start)] + next + s[end:]
    else:
        return s + '0'
    return s


class NoDataSourceFound(Exception):
    """
    Raised when a file that does not have any geospatial data is read in.
    """
    pass


class FileTypeNotAllowed(Exception):
    """
    Raised when a file that does not have any geospatial data is read in.
    """
    pass


class UploadError(Exception):

    pass


def launder(string):
    """
    Launders a string.
    (Port of the gdal LaunderName function)
    """
    for i in ['-', '#']:
        string = string.replace(i, '_')

    return string.lower()


def sizeof_fmt(num):
    """
    Returns human-friendly file sizes.
    """
    for x in ['bytes', 'KB', 'MB', 'GB']:
        if num < 1024.0:
            return "%3.1f%s" % (num, x)
        num /= 1024.0
    return "%3.1f%s" % (num, 'TB')


def load_handler(path, *args, **kwargs):
    """
    Given a path to a handler, return an instance of that handler.
    E.g.::
        >>> from django.http import HttpRequest
        >>> request = HttpRequest()
        >>> load_handler('django.core.files.uploadhandler.TemporaryFileUploadHandler', request)
        <TemporaryFileUploadHandler object at 0x...>
    """
    return import_by_path(path)(*args, **kwargs)