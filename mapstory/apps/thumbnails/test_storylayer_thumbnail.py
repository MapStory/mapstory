from __future__ import division

from mapstory.tests.integration.geogig_uploader import GeoGigUploaderBase
from django.test import TestCase
import os

from geonode.layers.models import Layer
from mapstory.apps.thumbnails.tasks import CreateStoryLayerThumbnailTask, CreateStoryLayerAnimatedThumbnailTask
from PIL import Image, ImageChops
from StringIO import StringIO


def compare_images(img1, img2, rgb_difference=1):
    """compare two images.
       rgb_difference = how different pixels need to be to be considered different
                     1 -> any difference is detected
                     n -> larger means minor differences aren't detected (see code)
       different sizes ==> exception
       otherwise, return the % of pixels that aren't the same in the images.
       """
    # make sure they are RGB
    img1 = img1.convert("RGB")
    img2 = img2.convert("RGB")
    if img1.size[0] != img2.size[0] or img1.size[1] != img2.size[1]:
        raise Exception("compare_images - images aren't the same size")
    diffImage = ImageChops.difference(img1, img2)
    differentPixels = 0
    for w in range(0, diffImage.width):
        for h in range(0, diffImage.height):
            pixel = diffImage.getpixel((w, h))
            difference = pixel[0] + pixel[1] + pixel[2]  # absolute pixel difference
            if difference > rgb_difference:
                differentPixels += 1
    return differentPixels / (img1.size[0] * img1.size[1])


# simple tests to verify that the image comparer (compare_images) is working correctly
class TestImgCompare(TestCase):
    def test_img_compare_same(self):
        img1 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"))
        self.assertEqual(compare_images(img1, img2), 0.0)

    def test_img_compare_diff1(self):
        img1 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-no_basemap.png"))
        self.assertGreater(compare_images(img1, img2), 0.9)

    def test_img_compare_diff2(self):
        img1 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-no_wms.png"))
        self.assertGreater(compare_images(img1, img2), 0.1)


# ------------------------------------------------------------------------------------------------------------




# python manage.py test --noinput --nocapture  mapstory.apps.thumbnails.test_storylayer_thumbnail
class TestAnimatedStoryLayerThumbnailTask(GeoGigUploaderBase, TestCase):
    # lots of timelice -- directly call the timechooser
    def test_timeslice_reduction(self):
        timepositions = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()

        times = thumb_generator.choose_timeslices(timepositions, 4)
        self.assertEqual(len(times), 4)
        self.assertEqual(times, ['a/c', 'd/f', 'g/h', 'i/j'])
        times = thumb_generator.choose_timeslices(timepositions, 5)
        self.assertEqual(len(times), 5)
        self.assertEqual(times, ['a/b', 'c/d', 'e/f', 'g/h', 'i/j'])

    # we create an animated GIF and then verify it
    # this is testing the thumb_generator.create_animated_GIF(fnames) method.
    #
    def test_animated_GIF_creation(self):
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()
        fnames = [
            os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"),
            os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-no_basemap.png"),
            os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-no_wms.png")
        ]
        orig_images = [Image.open(fname) for fname in fnames]

        gif_data = thumb_generator.create_animated_GIF(fnames)
        image_file = StringIO(gif_data)
        gif_image = Image.open(image_file)

        self.assertTrue(gif_image.is_animated)
        self.assertEqual(gif_image.n_frames, 3)

        frames = [Image.new('RGBA', gif_image.size), Image.new('RGBA', gif_image.size),
                  Image.new('RGBA', gif_image.size)]
        gif_image.seek(0)
        frames[0].paste(gif_image)
        gif_image.seek(1)
        frames[1].paste(gif_image)
        gif_image.seek(2)
        frames[2].paste(gif_image)

        # due to pallet differences, we allow a little bit of difference
        self.assertTrue(compare_images(orig_images[0], frames[0], 12) < 0.05)
        self.assertTrue(compare_images(orig_images[1], frames[1], 12) < 0.05)
        self.assertTrue(compare_images(orig_images[2], frames[2], 12) < 0.05)

    # note - while this is running, there is likely a thumbnail generation task occuring in the background
    # (kicked off by the importer)
    #   So, the layer may or may not have a thumbnail attached to it (and might have one in the future).
    def test_railroads(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'railroads.zip', 'YEAR')
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()

        # verify image - quick check to see if the size is correct (which means it generated an image)
        imageData = thumb_generator.create_screenshot(layer)
        image_file = StringIO(imageData)
        image = Image.open(image_file)

        self.assertEqual(image.size[0], 200)
        self.assertEqual(image.size[1], 150)
        self.assertTrue(image.is_animated)
        self.assertEqual(image.n_frames, 6)

    def test_prisons(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'PRISONS.csv', 'Year')
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()

        # verify image - quick check to see if the size is correct (which means it generated an image)
        imageData = thumb_generator.create_screenshot(layer)
        image_file = StringIO(imageData)
        image = Image.open(image_file)

        self.assertEqual(image.size[0], 200)
        self.assertEqual(image.size[1], 150)
        self.assertTrue(image.is_animated)
        self.assertEqual(image.n_frames, 10)

    # test an empty layer -- this will not be animated
    def test_empty_layer(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'empty_layer.zip', 'date')
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()

        imageData = thumb_generator.create_screenshot(layer)
        image_file = StringIO(imageData)
        image = Image.open(image_file)

        self.assertEqual(image.format, "PNG") # not a GIF



# ------------------------------------------------------------------------------------------------------------

# python manage.py test --noinput --nocapture  mapstory.apps.thumbnails.test_storylayer_thumbnail
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

        # verify image - quick check to see if the size is correct (which means it generated an image)
        imageData = thumb_generator.create_screenshot(layer)
        image_file = StringIO(imageData)
        image = Image.open(image_file)

        self.assertEqual(image.size[0], 200)
        self.assertEqual(image.size[1], 150)

        # image comparision - check that the generated thumbnail matches the pre-checked thumbnail
        img_pregen = Image.open(os.path.realpath("mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png"))
        percent_diff = compare_images(img_pregen, image)
        if percent_diff > 0.02:  # > 2% different
            raise Exception(
                "thumbnail does not match test image - " + thumb_generator.get_official_thumbnail_name(layer))
            # GETTING TEST CASE FAILURE HERE?
            #
            # If you've changed the style or basemap, this will fail.  However, its easy to fix
            # The above failure will spit out something like 'layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png'
            # docker cp mapstory_django_1:/var/lib/mapstory/media/thumbs/layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png .
            # manually verify that the image is correct, then replace railroads-thumb-correct.png
            # cp layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png mapstory/apps/thumbnails/test_imgs/railroads-thumb-correct.png

    def test_withoutFeatures(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'empty_layer.zip', 'date')
        thumb_generator = CreateStoryLayerThumbnailTask()

        # this layer has features in it
        # this layer has features in it
        self.assertFalse(thumb_generator.has_features(layer))

        # validate bounding box and time
        bounding_box, timepositions = thumb_generator.retreive_WMS_metadata(layer)
        self.assertIsNone(timepositions)
        # for empty datasets, bounding box is JTS default (which is invalid)
        self.assertTrue(bounding_box[0] > bounding_box[2])

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
        result, _out, _err = thumb_generator.run_process(["python", "-c", "exit(1)"], timeout=2)
        self.assertEqual(result, 1)

        # runs too long
        result, _out, _err = thumb_generator.run_process(["sleep", "3"], timeout=1)
        self.assertEqual(result, 124)

        # works fine
        result, _out, _err = thumb_generator.run_process(["python", "-c", "exit(0)"], timeout=2)
        self.assertEqual(result, 0)

        # capture output
        result, _out, _err = thumb_generator.run_process(["python", "-c", "print 'abc'+'def'"], timeout=2)
        self.assertEqual(result, 0)
        self.assertTrue("abcdef" in _out)
