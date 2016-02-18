from django import db

from osgeo_importer.inspectors import OGRTruncatedConverter
from osgeo_importer.handlers import ImportHandler, ensure_can_run
from .views import layer_append_minimal


class LayerAppendHandler(ImportHandler):
    """
    Appends data from the source to the target dataset.
    """

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Skips this layer if the user is not appending data to another dataset.
        """
        return 'appendTo' in layer_config

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Appends data from Geoserver layer into another.
        """
        return layer_append_minimal(layer, layer_config.get('appendTo'))


class TruncatedNameHandler(ImportHandler):
    """
    Converts truncated field names from the source to the target dataset field name.
    """

    def can_run(self, layer, layer_config, *args, **kwargs):
        return 'appendTo' in layer_config

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        d = db.connections['datastore'].settings_dict
        connection_string = "PG:dbname='%s' user='%s' password='%s' host='%s' port='%s'" % (d['NAME'], d['USER'],
                                                                        d['PASSWORD'], d['HOST'], d['PORT'])

        with OGRTruncatedConverter(connection_string) as datasource:
            converted_fields = datasource.convert_truncated(str(layer),str(layer_config.get('appendTo')))

        for date_field in set(layer_config.get('convert_to_date', [])):
            if date_field in converted_fields:
                new_field_name = converted_fields[date_field]
                layer_config['convert_to_date'].remove(date_field)
                layer_config['convert_to_date'].append(new_field_name)

                for date_option in ('start_date', 'end_date'):
                    if layer_config.get(date_option) == date_field:
                        layer_config[date_option] = new_field_name.lower()

