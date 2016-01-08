from .importer.handlers import ImportHandler, ensure_can_run
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