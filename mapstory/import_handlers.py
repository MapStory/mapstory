from django import db

from osgeo_importer.handlers import ImportHandlerMixin, ensure_can_run
from osgeo_importer.inspectors import OGRTruncatedConverter

from osgeo_importer.handlers.geoserver import GeoserverHandlerMixin

from .views import layer_append_minimal


class LayerAppendHandler(ImportHandlerMixin):
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
        return layer_append_minimal(layer, layer_config.get('appendTo'), kwargs.get('request_cookies'))


class TruncatedNameHandler(ImportHandlerMixin):
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


class DefaultStyleHandler(GeoserverHandlerMixin):
    """
    Apply a default MapStory theme SLD style to imported layer
    """

    def can_run(self, layer, layer_config, *args, **kwargs):
        """
        Only run this handler if the layer is found in Geoserver and the layer's style is one of the default styles.
        """
        self.catalog._cache.clear()
        self.layer = self.catalog.get_layer(layer)

        if self.layer and self.layer.default_style:
            return self.layer.default_style.name in ['polygon', 'point', 'line']
        else:
            return False

    @ensure_can_run
    def handle(self, layer, layer_config, *args, **kwargs):
        """
        Default MapStory style applied depending on feature type
        """
        sld = self.get_feature_type(self.layer)

        gs_layer = self.catalog.get_layer(self.layer.name)
        gs_layer.default_style = sld
        self.catalog.save(gs_layer)

    def get_feature_type(self, layer):
        """
        Returns appropriate style to use based on feature type
        """
        if layer.resource.resource_type == 'featureType':
            res = layer.resource
            res.fetch()
            ft = res.store.get_resources(res.name)
            ft.fetch()
            for attr in ft.dom.find("attributes").getchildren():
                attr_binding = attr.find("binding")
                if "jts.geom" in attr_binding.text:
                    if "Polygon" in attr_binding.text:
                        name = "Generic_Mapstory_Polygon"
                    elif "Line" in attr_binding.text:
                        name = "Generic_Mapstory_Line"
                    elif "Point" in attr_binding.text:
                        name = "Generic_Mapstory_Point"
                    else:
                        name = "generic"
        return name