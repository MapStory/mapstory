from mapstory.import_handlers import LayerAppendHandler, TruncatedNameHandler
from osgeo_importer.handlers import ImportHandlerMixin
from mapstory.tests.MapStoryTestMixin import MapStoryTestMixin


class ImportHandlerTests(MapStoryTestMixin):
    def test_layer_append_handler(self):
        self.assertIsNotNone(LayerAppendHandler)
        handlerMixin = ImportHandlerMixin("mock")
        appendHandler = LayerAppendHandler(handlerMixin)
        badLayer = ""
        badLayerConfig = ""
        self.assertEqual(appendHandler.can_run(badLayer, badLayerConfig, ""), False)
        #TODO: Test postivie can_run()
        self.assertIsNone(appendHandler.handle(badLayer, badLayerConfig, ""))

    def test_truncated_name_handler(self):
        self.assertIsNotNone(TruncatedNameHandler)
        handlerMixin = ImportHandlerMixin("mock")
        truncatedHandler = TruncatedNameHandler(handlerMixin)
        badLayer = ""
        badLayerConfig = ""
        self.assertEqual(truncatedHandler.can_run(badLayer, badLayerConfig, ""), False)
        self.assertIsNone(truncatedHandler.handle(badLayer, badLayerConfig, ""))
        #TODO: Test postivie can_run()
