import os
import ogr
import osr
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
from django import db
from django.conf import settings
from django.utils.module_loading import import_by_path

logger = logging.getLogger(__name__)

ogr.UseExceptions()


DEFAULT_IMPORT_HANDLERS = ['mapstory.importer.import_handlers.FieldConverterHandler',
                           'mapstory.importer.import_handlers.GeoserverPublishHandler',
                           'mapstory.importer.import_handlers.GeoServerTimeHandler',
                           'mapstory.importer.import_handlers.GeoNodePublishHandler']

IMPORT_HANDLERS = getattr(settings, 'IMPORT_HANDLERS', DEFAULT_IMPORT_HANDLERS)

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


class Import(object):

    file_extensions = ['shp', 'zip']

    def import_file(self, filename, **kwargs):
        raise NotImplementedError

    def file_extension_not_allowed(self, request, *args, **kwargs):
        logger.warning('File extension not allowed.')
        raise FileTypeNotAllowed


class InspectorMixin(object):
    """
    Inspectors open data sources and return information about them.
    """

    opener = None

    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    def __enter__(self):
        self.open(*self.args, **self.kwargs)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def open(self, *args, **kwargs):
        raise NotImplementedError

    def close(self, *args, **kwargs):
        raise NotImplementedError

    def describe_fields(self):
        raise NotImplementedError

    def file_type(self):
        raise NotImplementedError


class OGRInspector(InspectorMixin):

    def __init__(self, connection_string, *args, **kwargs):
        self.connection_string = connection_string
        self.data = None
        super(OGRInspector, self).__init__(*args, **kwargs)

    def open(self, *args, **kwargs):
        """
        Opens the connection_string.
        """
        # "1" argument makes the data writeable
        self.data = ogr.Open(self.connection_string, 1)

        if self.data is None:
            raise NoDataSourceFound

        return self.data

    def close(self, *args, **kwargs):
        self.data = None


class GDALInspector(InspectorMixin):

    INVALID_GEOMETRY_TYPES = ['None']

    def __init__(self, connection_string, *args, **kwargs):
        self.file = connection_string
        self.data = None
        super(GDALInspector, self).__init__(*args, **kwargs)

    def close(self, *args, **kwargs):
        self.data = None

    def get_filetype(self, filename):
        """
        Gets the filetype.
        """
        try:
            return os.path.splitext(filename)[1]
        except IndexError:
            return

    @property
    def method_safe_filetype(self):
        """
        Converts the filetype (ie extension) to a method-safe string.
        """
        file_type = self.get_filetype(self.file)

        if file_type:
            return file_type.replace('.', '')

    def prepare_csv(self, filename, *args, **kwargs):
        """
        Adds the <X|Y|GEOM>_POSSIBLE_NAMES opening options.
        """
        x_possible = getattr(settings, 'IMPORT_CSV_X_FIELDS', ['Lon*', 'x', 'lon*'])
        y_possible = getattr(settings, 'IMPORT_CSV_Y_FIELDS', ['Lat*', 'y', 'lat*'])
        geom_possible = getattr(settings, 'IMPORT_CSV_GEOM_FIELDS',
                                ['geom', 'GEOM', 'WKT', 'the_geom', 'THE_GEOM', 'WKB'])

        oo = kwargs.get('open_options', [])

        oo.append('X_POSSIBLE_NAMES={0}'.format(','.join(x_possible)))
        oo.append('Y_POSSIBLE_NAMES={0}'.format(','.join(y_possible)))
        oo.append('GEOM_POSSIBLE_NAMES={0}'.format(','.join(geom_possible)))

        kwargs['open_options'] = oo

        return filename, args, kwargs

    def prepare_zip(self, filename, *args, **kwargs):
        """
        Appends '/vsizip/' to the filename path.
        """

        return '/vsizip/' + filename, args, kwargs

    def prepare_gz(self, filename, *args, **kwargs):
        """
        Appends '/vsigzip/' to the filename path.
        """

        return '/vsigzip/' + filename, args, kwargs

    def open(self, *args, **kwargs):
        """
        Opens the file.
        """
        filename = self.file

        prepare_method = 'prepare_{0}'.format(self.method_safe_filetype)

        if hasattr(self, prepare_method):
            # prepare hooks make extension specific modifications to input parameters
            filename, args, kwargs = getattr(self, prepare_method)(filename, *args, **kwargs)

        open_options = kwargs.get('open_options', [])
        self.data = gdal.OpenEx(filename, open_options=open_options)

        if self.data is None:
            raise NoDataSourceFound

        return self.data

    @staticmethod
    def geometry_type(number):
        """
        Returns a string of the geometry type based on the number.
        """
        try:
            return GDAL_GEOMETRY_TYPES[number]
        except KeyError:
            return

    def describe_fields(self):
        """
        Returns a dict of the layers with fields and field types.
        """
        opened_file = self.data
        description = []

        if not opened_file:
            opened_file = self.open()

        for n in range(0, opened_file.GetLayerCount()):
            layer = opened_file.GetLayer(n)
            layer_description = {'name': layer.GetName(),
                                 'feature_count': layer.GetFeatureCount(),
                                 'fields': [],
                                 'index': n,
                                 'geom_type': self.geometry_type(layer.GetGeomType())
            }

            layer_definition = layer.GetLayerDefn()
            for i in range(layer_definition.GetFieldCount()):
                field_desc = {}
                field = layer_definition.GetFieldDefn(i)
                field_desc['name'] = field.GetName()
                field_desc['type'] = field.GetFieldTypeName(i)
                layer_description['fields'].append(field_desc)

            description.append(layer_description)

        return description

    def get_driver(self):
        opened_file = self.data

        if not opened_file:
            opened_file = self.open()

        return opened_file.GetDriver()

    def file_type(self):
        """
        Returns the data's file type (via the GDAL driver name)
        """
        try:
            return self.get_driver().ShortName
        except AttributeError:
            return

class GDALImport(Import):

    _import_handlers = []
    source_inspectors = [GDALInspector]
    target_inspectors = [OGRInspector]

    def __init__(self, filename, target_store=None):
        self.file = filename
        self.completed_layers = []

        if target_store is None:
            d = db.connections['datastore'].settings_dict
            connection_string = "PG:dbname='%s' user='%s' password='%s' host='%s' port='%s'" % (d['NAME'], d['USER'],
                                                                                                d['PASSWORD'],
                                                                                                d['HOST'], d['PORT'])
            self.target_store = connection_string

    def _initialize_handlers(self):
        self._import_handlers = [load_handler(handler, self)
                                 for handler in IMPORT_HANDLERS]
    @property
    def import_handlers(self):
        """
        Initializes handlers and/or returns them.
        """
        if not self._import_handlers:
            self._initialize_handlers()

        return self._import_handlers

    def open_datastore(self, connection_string, inspectors, *args, **kwargs):
        """
        Opens the source source data set using GDAL.
        """

        for inspector in inspectors:
            data = inspector(connection_string, *args, **kwargs).open()
            if data is not None:
                return data

    def open_source_datastore(self, connection_string, *args, **kwargs):
        """
        Opens the source source data set using GDAL.
        """

        return self.open_datastore(connection_string, self.source_inspectors, *args, **kwargs)

    def open_target_datastore(self, connection_string, *args, **kwargs):
        """
        Opens the target data set using OGR.
        """

        return self.open_datastore(connection_string, self.target_inspectors, *args, **kwargs)

    def create_target_dataset(self, target_datastore, layer_name, *args, **kwargs):
        """
        Creates the data source in the target data store.
        """
        return target_datastore.CreateLayer(layer_name, *args, **kwargs)

    def handle(self, configuration_options, *args, **kwargs):
        """
        Executes the entire import process.
        1) Imports the dataset from the source dataset to the target.
        2) Executes arbitrary handlers that can modify the data set.
        3) Executes arbitrary publish handlers to publish the data set.
        """

        layers = self.import_file(configuration_options=configuration_options)

        for layer, config in layers:
            config['handler_results'] = self.run_import_handlers(layer, config)

        return layers

    def run_import_handlers(self, layer, layer_config, *args, **kwargs):
        """
        Handlers that are run on each layer of a data set.
        """
        results = []

        for handler in self.import_handlers:
            results.append({type(handler).__name__ : handler.handle(layer, layer_config, *args, **kwargs)})

        return results

    def import_file(self, *args, **kwargs):
        """
        Loads data that has been uploaded into whatever format we need for serving.
        """
        filename = self.file
        err = GdalErrorHandler()
        gdal.PushErrorHandler(err.handler)
        configuration_options = kwargs.get('configuration_options', [{'index': 0}])

        # Configuration options should be a list at this point since the importer can process multiple layers in a
        # single import
        if isinstance(configuration_options, dict):
            configuration_options = [configuration_options]

        data = self.open_source_datastore(filename, *args, **kwargs)
        target_file = self.open_target_datastore(self.target_store)

        target_create_options = []

        # Prevent numeric field overflow for shapefiles https://trac.osgeo.org/gdal/ticket/5241
        if target_file.GetDriver().GetName() == 'PostgreSQL':
            target_create_options.append('PRECISION=NO')

        for layer_options in configuration_options:
            layer = data.GetLayer(layer_options.get('index'))
            layer_name = layer_options.get('name', layer.GetName().lower())
            srs = layer.GetSpatialRef()

            if layer_name == 'ogrgeojson':
                try:
                    layer_name = os.path.splitext(os.path.basename(filename))[0].lower()
                except IndexError:
                    pass

            layer_name = launder(str(layer_name))

            # if the layer name already exists, increment it
            while target_file.GetLayerByName(layer_name):
                layer_name = increment(layer_name)

            # default the layer to 4326 if a spatial reference is not provided
            if not srs:
                srs = osr.SpatialReference()
                srs.ImportFromEPSG(4326)

            target_layer = self.create_target_dataset(target_file, layer_name, srs,
                                                      layer.GetGeomType(), options=target_create_options)

            # adding fields to new layer
            layer_definition = ogr.Feature(layer.GetLayerDefn())

            for i in range(layer_definition.GetFieldCount()):
                target_layer.CreateField(layer_definition.GetFieldDefnRef(i))

            for i in range(0, layer.GetFeatureCount()):
                feature = layer.GetFeature(i)

                if feature:
                    target_layer.CreateFeature(feature)

            self.completed_layers.append([target_layer.GetName(), layer_options])

        return self.completed_layers


def launder(string):
    """
    Launders a string.
    (Port of the gdal LaunderName function)
    """
    for i in ['-', '#']:
        string = string.replace(i, '_')

    return string.lower()


class OGRFieldConverter(OGRInspector):

    def convert_field(self, layer_name, field):
        fieldname = '{0}_as_date'.format(field)
        target_layer = self.data.GetLayerByName(layer_name)

        while target_layer.GetLayerDefn().GetFieldIndex(fieldname) >= 0:
            fieldname = increment(fieldname)

        target_layer.CreateField(ogr.FieldDefn(fieldname, ogr.OFTDateTime))
        field_index = target_layer.GetLayerDefn().GetFieldIndex(fieldname)

        for feat in target_layer:

            if not feat:
                continue

            string_field = feat[str(field)]

            if string_field:
                pars = parse(str(string_field))

                feat.SetField(field_index, pars.year, pars.month, pars.day, pars.hour, pars.minute, pars.second,
                              pars.microsecond)

                target_layer.SetFeature(feat)

        return fieldname


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