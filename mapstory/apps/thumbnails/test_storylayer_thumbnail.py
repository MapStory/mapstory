from mapstory.tests.integration.geogig_uploader import GeoGigUploaderBase
from django.test import TestCase
import os

from geonode.layers.models import Layer
from mapstory.apps.thumbnails.tasks import CreateStoryLayerThumbnailTask


# python manage.py test --noinput mapstory.apps.thumbnails.test_storylayer_thumbnail
class TestStoryLayerThumbnailTask(GeoGigUploaderBase, TestCase):

    # note - while this is running, there is likely a thumbnail generation task occuring in the background
    # (kicked off by the importer)
    #   So, the layer may or may not have a thumbnail attached to it (and might have one in the future).
    def test_withFeatures(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'railroads.zip', 'YEAR')
        thumb_generator = CreateStoryLayerThumbnailTask()

        # this layer has features in it
        self.assertTrue(thumb_generator.has_features(layer))

        # validate bounding box and time
        bounding_box, timepositions = thumb_generator.retreive_WMS_metadata(layer)
        self.assertTrue(abs(bounding_box[0] - -123.035331726) < 0.0000001)
        self.assertTrue(abs(bounding_box[1] - 28.609628677368164) < 0.0000001)
        self.assertTrue(abs(bounding_box[2] - -67.27764129638672) < 0.0000001)
        self.assertTrue(abs(bounding_box[3] - 46.011295318603516) < 0.0000001)

        self.assertEqual(len(timepositions), 6)
        self.assertEqual(timepositions[0], '1840-01-01T00:00:00.000Z')
        self.assertEqual(timepositions[5], '1870-01-01T00:00:00.000Z')

        # this shouldn't throw an error
        thumb_generator.run(layer.pk, overwrite=True)
        layer = Layer.objects.get(pk=layer.pk)  # reload from disk (the task will change it in a different context)

        # this should not be the default
        self.assertTrue(layer.has_thumbnail())

        # imbedded (in Layer#Links) should be the same as saved in Layer#thumbnail_url)
        self.assertEqual(layer.thumbnail_url, layer.get_thumbnail_url())

        # url is correct
        self.assertTrue(layer.thumbnail_url.endswith(thumb_generator.get_official_thumbnail_name(layer)))

        # verify that setting thumbnail to default works
        thumb_generator.set_layer_thumbnail_default(layer)
        self.assertFalse(layer.has_thumbnail())
        self.assertEqual(layer.thumbnail_url, layer.get_thumbnail_url())


    def test_withoutFeatures(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'empty_layer.zip', 'date')
        thumb_generator = CreateStoryLayerThumbnailTask()

        # this layer has features in it
        # this layer has features in it
        self.assertFalse(thumb_generator.has_features(layer))

        # validate bounding box and time
        bounding_box, timepositions = thumb_generator.retreive_WMS_metadata(layer)
        self.assertIsNone(timepositions)
        self.assertTrue(
            bounding_box[0] > bounding_box[2])  # for empty datasets, bounding box is JTS default (which is invalid)

        # there's no data, so no changes!
        self.assertFalse(layer.has_thumbnail())
        thumb_generator.run(layer.pk, overwrite=True)
        layer = Layer.objects.get(pk=layer.pk)  # reload from disk (the task will change it in a different context)
        self.assertFalse(layer.has_thumbnail())

        # imbedded (in Layer#Links should be the same as saved in Layer#thumbnail_url)
        self.assertEqual(layer.thumbnail_url, layer.get_thumbnail_url())

    def test_process_running(self):
        thumb_generator = CreateStoryLayerThumbnailTask()

        # non-zero exit
        result = thumb_generator.run_process(["python", "-c", "exit(1)"], timeout=2)
        self.assertEqual(result, 1)

        # runs too long
        result = thumb_generator.run_process(["sleep", "3"], timeout=1)
        self.assertIsNone(result)

        # works fine
        result = thumb_generator.run_process(["python", "-c", "exit(0)"], timeout=2)
        self.assertEqual(result, 0)
