from __future__ import division

import os
import uuid
from StringIO import StringIO
from unittest import skip

from django.test import TestCase

from geonode.layers.models import Layer
from geonode.maps.models import MapLayer
from mapstory.mapstories.models import Map, MapStory
from mapstory.tests.integration.geogig_uploader import GeoGigUploaderBase
from mapstory.thumbnails.tasks import (CreateStoryAnimatedThumbnailTask,
                                       CreateStoryLayerAnimatedThumbnailTask,
                                       CreateStoryLayerThumbnailTask)
from PIL import Image, ImageChops


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
        img1 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"))
        self.assertEqual(compare_images(img1, img2), 0.0)

    def test_img_compare_diff1(self):
        img1 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-no_basemap.png"))
        self.assertGreater(compare_images(img1, img2), 0.9)

    def test_img_compare_diff2(self):
        img1 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"))
        img2 = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-no_wms.png"))
        self.assertGreater(compare_images(img1, img2), 0.1)


# ------------------------------------------------------------------------------------------------------------

# python manage.py test --noinput --nocapture  --keepdb mapstory.thumbnails.test_storylayer_thumbnail
class TestAStoryThumbnailTask(GeoGigUploaderBase, TestCase):

    # make a Mapstory object, with basemap layer
    def add_mapstory(self):
        mapstory = MapStory()
        mapstory.name = "test_case1"
        mapstory.owner = self.admin_user
        mapstory.uuid = str(uuid.uuid1())
        mapstory.save()

        map = Map()
        map.story = mapstory
        map.chapter_index = 0
        map.title = "test_case"
        map.projection = 'EPSG:4326'
        map.owner = mapstory.owner
        map.uuid = str(uuid.uuid1())
        map.zoom = 4
        map.center_x = 0
        map.center_y = 0
        map.save()

        mapstory.chapter_list.add(map)
        mapstory.save()

        # background
        maplayer_background = MapLayer()
        maplayer_background.map = map
        maplayer_background.name = "control-room"
        maplayer_background.stack_order = 4
        maplayer_background.opacity = 1.0
        maplayer_background.fixed = False
        maplayer_background.visibility = True
        maplayer_background.source_params = u'{"hidden": true, "ptype": "gxp_mapboxsource"}'
        maplayer_background.layer_config = ""
        maplayer_background.group = "background"
        maplayer_background.save()

        # map.layers.add(maplayer)

        map.save()
        return mapstory

    # given a mapstory and already loaded layer, add it (with the given style name)
    #  NOTE: style name should already existing in geoserver (this doesn't upload it)
    def add_layer_to_mapstory(self, mapstory, layer, stack_order, style):
        map = mapstory.chapters[0]
        maplayer = MapLayer()
        maplayer.map = map
        maplayer.name = layer.name
        maplayer.stack_order = stack_order
        maplayer.opacity = 1.0
        maplayer.fixed = False
        maplayer.visibility = True
        maplayer.source_params = u'{"lazy": true, "name": "local geoserver", "title": "Local Geoserver", "ptype": "gxp_wmscsource", "restUrl": "/gs/rest", "isVirtualService": false, "mapLayerRequiresServer": true}'
        maplayer.layer_config = ""
        maplayer.styles = style
        maplayer.save()

    # verify that its a GIF image, right size and has the expected # of frames
    def assertGIF(self, gif_data, nframes):
        image_file = StringIO(gif_data)
        gif_image = Image.open(image_file)

        self.assertEquals(gif_image.format, "GIF")
        self.assertEqual(gif_image.size[0], 200)
        self.assertEqual(gif_image.size[1], 150)
        if nframes > 1:
            self.assertTrue(gif_image.is_animated)
            self.assertEqual(gif_image.n_frames, nframes)

    # simple test to verify that a story with no layers gets the default thumbnail
    def _test_no_layers(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        thumb_generator = CreateStoryAnimatedThumbnailTask()

        info = thumb_generator.get_all_thumbnail_info(chapter)
        self.assertIsNone(info)

    # mapstory with just the railway data - verify that its going to call the phantom stuff with the correct info
    def _test_rail(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        self.add_layer_to_mapstory(mapstory, self.layer_rail, 12, "")

        thumb_generator = CreateStoryAnimatedThumbnailTask()
        info = thumb_generator.get_all_thumbnail_info(chapter)
        self.assertTrue(abs(info["full_bounds"][0] - -123.035331726) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][1] - 28.609628677368164) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][2] - -67.27764129638672) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][3] - 46.011295318603516) < 0.0000001)

        self.assertEquals(len(info["intervals_by_layer"]), 6)
        # should all a [6][1] matrix
        self.assertEquals(len(info["intervals_by_layer"][0]), 1)
        self.assertEquals(len(info["intervals_by_layer"][1]), 1)
        self.assertEquals(len(info["intervals_by_layer"][2]), 1)
        self.assertEquals(len(info["intervals_by_layer"][3]), 1)
        self.assertEquals(len(info["intervals_by_layer"][4]), 1)
        self.assertEquals(len(info["intervals_by_layer"][5]), 1)

        self.assertEquals(info["intervals_by_layer"][0][0], "1840-01-01T00:00:00Z")
        self.assertEquals(info["intervals_by_layer"][5][0], "1870-01-01T00:00:00Z")

        self.assertEquals(info["layer_styles"], "")
        self.assertEquals(info["layer_names"], self.layer_rail.name)
        self.assertEquals(info["tile_URL"], "https://{a-b}.tiles.mapbox.com/v3/mapbox.control-room/{z}/{x}/{y}.png")
        img = thumb_generator.create_thumbnail_from_info(info)
        self.assertGIF(img, 6)

    # mapstory with just the 3 data layers and custom styles
    #  verify that its going to call the phantom stuff with the correct style info
    # NOTE: don't generate a thumbnail for this as the geoserver style isn't setup!
    def _test_styles(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        self.add_layer_to_mapstory(mapstory, self.layer_empty, 12, "style_a")
        self.add_layer_to_mapstory(mapstory, self.layer_prison, 13, "style_b")
        self.add_layer_to_mapstory(mapstory, self.layer_rail, 14, "style_c")

        thumb_generator = CreateStoryAnimatedThumbnailTask()
        info = thumb_generator.get_all_thumbnail_info(chapter)
        self.assertEquals(info["layer_styles"], "style_a,style_b,style_c")

    # mapstory with the 3 datasets (empy, prison, railways)
    # verify that its going to call the phantom stuff with the correct info
    def _test_all_3_layers(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        self.add_layer_to_mapstory(mapstory, self.layer_empty, 12, "")
        self.add_layer_to_mapstory(mapstory, self.layer_prison, 13, "")
        self.add_layer_to_mapstory(mapstory, self.layer_rail, 14, "")

        thumb_generator = CreateStoryAnimatedThumbnailTask()
        info = thumb_generator.get_all_thumbnail_info(chapter)

        self.assertEquals(len(info["intervals_by_layer"]), 10)
        # should all a [10][3] matrix
        self.assertEquals(len(info["intervals_by_layer"][0]), 3)
        self.assertEquals(len(info["intervals_by_layer"][1]), 3)
        self.assertEquals(len(info["intervals_by_layer"][2]), 3)
        self.assertEquals(len(info["intervals_by_layer"][3]), 3)
        self.assertEquals(len(info["intervals_by_layer"][4]), 3)
        self.assertEquals(len(info["intervals_by_layer"][5]), 3)
        self.assertEquals(len(info["intervals_by_layer"][6]), 3)
        self.assertEquals(len(info["intervals_by_layer"][8]), 3)
        self.assertEquals(len(info["intervals_by_layer"][9]), 3)

        self.assertTrue(abs(info["full_bounds"][0] - -165.288543701) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][1] - 19.6744384766) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][2] - -67.27764129638672) < 0.0000001)
        self.assertTrue(abs(info["full_bounds"][3] - 71.2739944458) < 0.0000001)

        self.assertEquals(info["intervals_by_layer"][0][0], 'NONE')
        self.assertEquals(info["intervals_by_layer"][0][1], '1811-01-01T00:00:00Z/1869-01-01T00:00:00Z')
        self.assertEquals(info["intervals_by_layer"][0][2], '1811-01-01T00:00:00Z/1869-01-01T00:00:00Z')

        self.assertEquals(info["intervals_by_layer"][9][0], 'NONE')
        self.assertEquals(info["intervals_by_layer"][9][1], '1992-01-01T00:00:00Z/9999-01-01T00:00:00Z')
        self.assertEquals(info["intervals_by_layer"][9][2], '1992-01-01T00:00:00Z/9999-01-01T00:00:00Z')

        self.assertEquals(info["layer_styles"], ",,")
        self.assertEquals(info["layer_names"],
                          self.layer_empty.name + "," + self.layer_prison.name + "," + self.layer_rail.name)
        self.assertEquals(info["tile_URL"], "https://{a-b}.tiles.mapbox.com/v3/mapbox.control-room/{z}/{x}/{y}.png")
        img = thumb_generator.create_thumbnail_from_info(info)
        self.assertGIF(img, 10)

    # mapstory with just the prison data - verify that its going to call the phantom stuff with the correct info
    def _test_prison(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        self.add_layer_to_mapstory(mapstory, self.layer_prison, 12, "")

        thumb_generator = CreateStoryAnimatedThumbnailTask()
        info = thumb_generator.get_all_thumbnail_info(chapter)

        self.assertEquals(len(info["intervals_by_layer"]), 10)
        # should all a [10][1] matrix
        self.assertEquals(len(info["intervals_by_layer"][0]), 1)
        self.assertEquals(len(info["intervals_by_layer"][1]), 1)
        self.assertEquals(len(info["intervals_by_layer"][2]), 1)
        self.assertEquals(len(info["intervals_by_layer"][3]), 1)
        self.assertEquals(len(info["intervals_by_layer"][4]), 1)
        self.assertEquals(len(info["intervals_by_layer"][5]), 1)
        self.assertEquals(len(info["intervals_by_layer"][6]), 1)
        self.assertEquals(len(info["intervals_by_layer"][8]), 1)
        self.assertEquals(len(info["intervals_by_layer"][9]), 1)

        self.assertEquals(info["intervals_by_layer"][0][0], "1811-01-01T00:00:00Z/1872-01-01T00:00:00Z")
        self.assertEquals(info["intervals_by_layer"][9][0], '1993-01-01T00:00:00Z/9999-01-01T00:00:00Z')

        self.assertEquals(info["layer_styles"], "")
        self.assertEquals(info["layer_names"], self.layer_prison.name)
        self.assertEquals(info["tile_URL"], "https://{a-b}.tiles.mapbox.com/v3/mapbox.control-room/{z}/{x}/{y}.png")
        img = thumb_generator.create_thumbnail_from_info(info)
        self.assertGIF(img, 10)

    # mapstory with just the empty dataset - verify that its going to call the phantom stuff with the correct info
    def _test_just_empty_layer(self):
        mapstory = self.add_mapstory()
        chapter = mapstory.chapters[0]
        self.add_layer_to_mapstory(mapstory, self.layer_empty, 12, "")

        thumb_generator = CreateStoryAnimatedThumbnailTask()
        info = thumb_generator.get_all_thumbnail_info(chapter)
        self.assertEquals(info["full_bounds"], [-180, -90, 180, 90])
        self.assertEquals(info["intervals_by_layer"][0], ['NONE'])
        self.assertEquals(info["layer_styles"], "")
        self.assertEquals(info["layer_names"], self.layer_empty.name)
        self.assertEquals(info["tile_URL"], "https://{a-b}.tiles.mapbox.com/v3/mapbox.control-room/{z}/{x}/{y}.png")
        img = thumb_generator.create_thumbnail_from_info(info)
        self.assertGIF(img, 1)

    # meta test case - this loads the 3 datasets and then runs the above test cases that use this data
    #   If these were broken into their own test cases (not combined, as here), then it would be loading the
    #   data multiple times -- and that would be VERY VERY slow.
    def test_thumbnails(self):
        # pre-load datasets   THESE TAKE FOREVER TO LOAD
        self.layer_rail = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'railroads.zip',
                                                 'YEAR')
        self.layer_prison = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'PRISONS.csv',
                                                   'Year')
        self.layer_empty = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'empty_layer.zip',
                                                  'date')

        # run the actual tests here -- don't reload each test case (would take forever to run)
        self._test_no_layers()

        self._test_just_empty_layer()
        self._test_rail()
        self._test_prison()

        self._test_all_3_layers()

        self._test_styles()

    # test that the bounds computer is working
    def test_combine_bounds(self):
        metadata = [{"bounds": None}]
        full_bounds = CreateStoryAnimatedThumbnailTask.combine_bounds(metadata)
        self.assertEquals(full_bounds, [-180, -90, 180, 90])

        metadata = [{"bounds": [0, 0, -1, -1]}]  # this is null bounds
        full_bounds = CreateStoryAnimatedThumbnailTask.combine_bounds(metadata)
        self.assertEquals(full_bounds, [-180, -90, 180, 90])

        metadata = [{"bounds": [0, 0, -1, -1]}, {"bounds": [-100, -101, -98, -99]}, {"bounds": None}]
        full_bounds = CreateStoryAnimatedThumbnailTask.combine_bounds(metadata)
        self.assertEquals(full_bounds, [-100, -101, -98, -99])

        metadata = [{"bounds": [-6, 0, 10, 20]}, {"bounds": [5, 5, 15, 15]}, {"bounds": [-5, -5, -1, -1]}]
        full_bounds = CreateStoryAnimatedThumbnailTask.combine_bounds(metadata)
        self.assertEquals(full_bounds, [-6, -5, 15, 20])

        metadata = [{"bounds": [-6, 0, 10, 20]}, {"bounds": [5, 5, 15, 15]}, {"bounds": [-5, -5, -1, -1]},
                    {"bounds": [0, 0, -1, -1]}, {"bounds": None}]
        full_bounds = CreateStoryAnimatedThumbnailTask.combine_bounds(metadata)
        self.assertEquals(full_bounds, [-6, -5, 15, 20])

    # test that the timeslice computer is working
    def test_combine_timeslices(self):
        metadata = [{"timeslices": ['1890-01-01T00:00:00.0Z', '1889-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']}]
        full_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(metadata)
        self.assertEquals(full_timeslices, ['1889-01-01T00:00:00Z', '1890-01-01T00:00:00Z', '1892-01-01T00:00:00Z'])

        metadata = [{"timeslices": ['1889-01-01T00:00:00.0Z', '1890-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z',
                                    '1889-01-01T00:00:00.0Z', '1890-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']}]
        full_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(metadata)
        self.assertEquals(full_timeslices, ['1889-01-01T00:00:00Z', '1890-01-01T00:00:00Z', '1892-01-01T00:00:00Z'])

        metadata = [{"timeslices": ['1890-01-01T00:00:00.0Z', '1889-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']},
                    {"timeslices": ['1890-01-01T00:00:00.0Z', '1889-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']}]
        full_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(metadata)
        self.assertEquals(full_timeslices, ['1889-01-01T00:00:00Z', '1890-01-01T00:00:00Z', '1892-01-01T00:00:00Z'])

        metadata = [{"timeslices": ['1890-01-01T00:00:00.0Z', '1889-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']},
                    {"timeslices": None}]
        full_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(metadata)
        self.assertEquals(full_timeslices, ['1889-01-01T00:00:00Z', '1890-01-01T00:00:00Z', '1892-01-01T00:00:00Z'])

        metadata = [{"timeslices": ['1890-01-01T00:00:00.0Z', '1889-01-01T00:00:00.0Z', '1892-01-01T00:00:00.0Z']},
                    {"timeslices": []}]
        full_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(metadata)
        self.assertEquals(full_timeslices, ['1889-01-01T00:00:00Z', '1890-01-01T00:00:00Z', '1892-01-01T00:00:00Z'])

    # verify that its choosing the right basemap info
    def test_tileURL(self):
        chapter = mock_Map()  # mocking a map
        layer = mock_Map()  # mocking a layer
        layer.name = "mapnik"
        layer.visibility = True
        layer.group = "background"
        chapter.layers = [layer]

        url = CreateStoryAnimatedThumbnailTask.tileURL(chapter)
        self.assertEquals(url, 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png');

        layer.name = "hot"
        url = CreateStoryAnimatedThumbnailTask.tileURL(chapter)
        self.assertEquals(url, 'https://{a-b}.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png');

        layer.name = "geography-class"
        url = CreateStoryAnimatedThumbnailTask.tileURL(chapter)
        self.assertEquals(url, 'https://{a-b}.tiles.mapbox.com/v3/mapbox.geography-class/{z}/{x}/{y}.png');

    # verify that the frame/layer timeslices are being correctly calculated
    def test_create_layers_intervals(self):
        intervals = ["a/b", "c/d"]
        layer_metadatas = [{'timeslices': []}, {'timeslices': []}, {'timeslices': []}]
        combined_intervals = CreateStoryAnimatedThumbnailTask.create_layers_intervals(intervals, layer_metadatas)
        self.assertEquals(len(combined_intervals), 2)
        self.assertEquals(combined_intervals[0], ['a/b', 'a/b', 'a/b'])
        self.assertEquals(combined_intervals[1], ['c/d', 'c/d', 'c/d'])

        layer_metadatas = [{'timeslices': []}, {'timeslices': None}, {'timeslices': []}]
        combined_intervals = CreateStoryAnimatedThumbnailTask.create_layers_intervals(intervals, layer_metadatas)
        self.assertEquals(len(combined_intervals), 2)
        self.assertEquals(combined_intervals[0], ['a/b', 'NONE', 'a/b'])
        self.assertEquals(combined_intervals[1], ['c/d', 'NONE', 'c/d'])

class mock_Map(object):
    pass

# ------------------------------------------------------------------------------------------------------------


# python manage.py test --noinput --nocapture  mapstory.thumbnails.test_storylayer_thumbnail
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
    @skip
    def test_animated_GIF_creation(self):
        thumb_generator = CreateStoryLayerAnimatedThumbnailTask()
        fnames = [
            os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"),
            os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-no_basemap.png"),
            os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-no_wms.png")
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
        self.assertTrue(compare_images(orig_images[0], frames[0], 14) < 0.05)
        self.assertTrue(compare_images(orig_images[1], frames[1], 14) < 0.05)
        self.assertTrue(compare_images(orig_images[2], frames[2], 14) < 0.05)

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

# python manage.py test --noinput --nocapture  mapstory.thumbnails.test_storylayer_thumbnail
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
        bounding_box, timepositions = thumb_generator.retreive_WMS_metadata(layer.typename.encode('utf-8'))
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
        img_pregen = Image.open(os.path.realpath("mapstory/thumbnails/test_imgs/railroads-thumb-correct.png"))
        percent_diff = compare_images(img_pregen, image,11)
        if percent_diff > 0.05:  # > 5% different
            raise Exception(
                "thumbnail does not match test image - " + thumb_generator.get_official_thumbnail_name(layer))
            # GETTING TEST CASE FAILURE HERE?
            #
            # If you've changed the style or basemap, this will fail.  However, its easy to fix
            # The above failure will spit out something like 'layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png'
            # docker cp mapstory_django_1:/var/lib/mapstory/media/thumbs/layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png .
            # manually verify that the image is correct, then replace railroads-thumb-correct.png
            # cp layer-a94ea7bb-97ae-48a7-8db5-1054ec90c92c-thumb.png mapstory/thumbnails/test_imgs/railroads-thumb-correct.png

    def test_withoutFeatures(self):
        layer = self.fully_import_file(os.path.realpath('mapstory/tests/sampledata/'), 'empty_layer.zip', 'date')
        thumb_generator = CreateStoryLayerThumbnailTask()

        # this layer has features in it
        # this layer has features in it
        self.assertFalse(thumb_generator.has_features(layer))

        # validate bounding box and time
        bounding_box, timepositions = thumb_generator.retreive_WMS_metadata(layer.typename.encode('utf-8'))
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
