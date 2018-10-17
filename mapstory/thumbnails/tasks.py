import datetime
import logging
import math
import os
import subprocess
import traceback
from tempfile import NamedTemporaryFile
from urlparse import urlparse

from django.conf import settings
from django.db import connection

import httplib2
import numpy
from geonode.base.models import Link
from geonode.layers.models import Layer
from geonode.layers.utils import create_gs_thumbnail_geonode
from lxml import etree
############################################################################################
from mapstory.celery import app
from mapstory.mapstories.models import Map, MapStory
from owslib.wms import WebMapService
from PIL import Image


# geonode:layer -> geonode,layer
# layer -> geonode,layer (geonode workspace assumed)
def decodeTypeName(typename):
    result = typename.split(":")
    if len(result) == 1:
        return "geonode", result[0]
    return result

# Celery-compatible task to create thumbnails using PhantomJS


class CreateStoryLayerThumbnailTask:
    """This creates a thumbnail using PhantomJS"""

    # location of the phantomJS files
    phantomjs_file = os.path.join(os.path.dirname(
        __file__), 'thumbnail_storylayer.js')
    # phantomjs_html = os.path.join(os.path.dirname(__file__), 'thumnail_storylayer.html')
    phantomjs_html = settings.SITEURL + settings.STATIC_URL + \
        "thumbnails/static/thumbnail_storylayer.html"

    def run_process(self, args, env={}, timeout=66):
        """Run a process - first arg should be the command name.
           This will return the exit code (non-zero = problem).
           If the process takes too long, it will aggressively terminate the process and return None
           timeout = max time to allow process to run (in seconds)
           env = extra environment variables to set (dictionary)
           Returns either the exit code from the process (0=good) or process exit code or 124 (timeout).

           Celery logs too verbose?  set celery worker_redirect_stdouts_level config to lower level
           """

        logging.debug("executing command: " + str(args))

        # use the command line timeout
        # execute like timeout 66 phantomjs ...
        args.insert(0, "timeout")
        args.insert(1, str(timeout))

        # update environment
        process_env = os.environ.copy()
        process_env.update(env)

        p = subprocess.Popen(args, env=process_env,
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = p.communicate()
        result = p.poll()

        logging.debug("command result - " + str(result))

        return result, out, err  # None if fail

    # add geoserver user/password to a request
    @staticmethod
    def request_geoserver_with_credentials(url):
        user = settings.OGC_SERVER['default']["USER"]
        password = settings.OGC_SERVER['default']["PASSWORD"]

        http_client = httplib2.Http()
        http_client.add_credentials(user, password)

        _netloc = urlparse(url).netloc
        http_client.authorizations.append(
            httplib2.BasicAuthentication(
                (user, password),
                _netloc,
                url,
                {},
                None,
                None,
                http_client
            )
        )
        resp, content = http_client.request(url)
        return content

    def has_features(self, layer):
        try:
            workspace, layername = decodeTypeName(
                layer.typename.encode('utf-8'))

            # workspace is hard-coded in the importer
            url = settings.OGC_SERVER['default']['LOCATION'] + workspace+"/"
            url += layername + "/wfs?request=GetFeature&maxfeatures=1&request=GetFeature&typename=" + \
                workspace+"%3A" + layername + "&version=1.1.0"

            feats = self.request_geoserver_with_credentials(url)
            root = etree.fromstring(feats)

            nfeatures = root.attrib['numberOfFeatures']
            return nfeatures == "1"
        except Exception as e:
            print "ERROR occurred communicating with WFS, url="+url
            if feats is not None:
                print "server response: "+str(feats)
            raise e

    # returns:
    #  bounding_box, timepositions = retreive_WMS_metadata(...)
    # bounding box = [xmin, ymin, xmax, ymax]
    # timepositions = list of dates (string)
    @staticmethod
    def retreive_WMS_metadata(typename):
        workspace, layername = decodeTypeName(typename)

        # workspace is hard-coded in the importer
        url = settings.OGC_SERVER['default']['LOCATION'] + workspace+"/"
        url += layername + "/wms?request=GetCapabilities&version=1.1.1"

        get_cap_data = CreateStoryLayerThumbnailTask.request_geoserver_with_credentials(
            url)
        wms = WebMapService(url, xml=get_cap_data)

        # I found that some dataset advertise illegal bounds - fix them up
        xmin = wms[layername].boundingBoxWGS84[0]
        if math.isnan(xmin) or math.isinf(xmin) or xmin < -180:
            xmin = -180

        ymin = wms[layername].boundingBoxWGS84[1]
        if math.isnan(ymin) or math.isinf(ymin) or ymin < -90:
            ymin = -90

        xmax = wms[layername].boundingBoxWGS84[2]
        if math.isnan(xmax) or math.isinf(xmax) or xmax > 180:
            xmax = 180

        ymax = wms[layername].boundingBoxWGS84[3]
        if math.isnan(ymax) or math.isinf(ymax) or ymax > 90:
            ymax = 90

        return [xmin, ymin, xmax, ymax], wms[layername].timepositions

    # phantomJSFile htmlFile wms layerName xmin ymin xmax ymax time output.fname
    def create_phantomjs_args(self, typeName, boundingBoxWGS84, tempfname, time="ALL",
                              basemapXYZURL='https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                              styles=""):

        workspace, layername = decodeTypeName(typeName)

        wms = settings.OGC_SERVER['default']['PUBLIC_LOCATION'] + \
            workspace+"/wms"
        xmin = boundingBoxWGS84[0]
        ymin = boundingBoxWGS84[1]
        xmax = boundingBoxWGS84[2]
        ymax = boundingBoxWGS84[3]

        args = ["phantomjs",
                "--ignore-ssl-errors=true",
                "--web-security=false",
                CreateStoryLayerThumbnailTask.phantomjs_file,
                CreateStoryLayerThumbnailTask.phantomjs_html,
                wms,
                layername,
                xmin, ymin, xmax, ymax,
                time,
                tempfname,
                basemapXYZURL,
                styles]
        args = [str(arg) for arg in args]  # convert numbers to string

        return args

    # get a temporary filename (don't forget to delete it when done)
    def create_temp_filename(self, filename_suffix='image'):
        file = NamedTemporaryFile(
            delete=False, prefix="temp_thumbnail_", suffix=filename_suffix)
        fname = file.name
        file.close()
        return fname

    # call phantomjs and save the thumbnail
    # return - image data
    def create_screenshot(self, layer):
        fname = self.create_temp_filename()
        try:
            boundingBoxWGS84, timepositions = self.retreive_WMS_metadata(
                layer.typename.encode('utf-8'))
            time = "NONE" if timepositions is None else "ALL"
            args = self.create_phantomjs_args(
                layer.typename.encode('utf-8'), boundingBoxWGS84, fname, time)
            resultCode, _out, _err = self.run_process(
                args, env={'QT_QPA_PLATFORM': 'minimal'})
            if (resultCode != 0):
                raise Exception(
                    'Unknown issue running PhantomJS for thumbnail generation - exit code='
                    + str(resultCode) + " -- args: " + str(args)
                    + "stdout:" + str(_out) + "stderr:" + str(_err))
            with open(fname, mode='rb') as file:
                imageData = file.read()
            return imageData
        finally:
            os.remove(fname)  # clean up

    # if there are any thumbnails associated with the layer, delete them.
    # This will set the thumbnail to the static "no thumbnail" image
    # NOTE: works with any ResourceBase (not just layer)
    def set_layer_thumbnail_default(self, layer):
        if not layer.has_thumbnail():
            return  # already done
        # remove any local thumbnails
        Link.objects.filter(resource=layer, name='Thumbnail').delete()
        # remove remote thumbnails (geonode implementation has this as a simple GetMap URL)
        Link.objects.filter(resource=layer, name='Remote Thumbnail').delete()
        # update layer
        layer.thumbnail_url = layer.get_thumbnail_url()

    # this is the official geonode thumbnail name
    def get_official_thumbnail_name(self, layer):
        return 'layer-' + layer.uuid + '-thumb.png'  # this is Geonode official naming

    def setup_thumbnail(self, layer, overwrite):
        # if we are not overwriting, and there's a real thumbnail there, then do nothing!
        if (overwrite) or (not layer.has_thumbnail()):
            # if there's no features, then we don't create a thumbnail -- use the default thumbnail
            if self.has_features(layer):
                imageData = self.create_screenshot(layer)
                finalFname = self.get_official_thumbnail_name(layer)
                layer.save_thumbnail(finalFname, imageData)
                return layer.thumbnail_url
            else:
                self.set_layer_thumbnail_default(layer)
                return None

        return layer.thumbnail_url

    # main celery task entry point
    def run(self, pk, overwrite=False):
        """Create a thumbnail for the given layer.
           If an actual (non-default) thumbnail exists and overwrite=False then this does nothing.
           Otherwise a thumbnail is generated:
                If there are no features in the layer --> set the thumbnail URL to default.
                Otherwise, run PhantomJS to create a new thumbnail (layer#save_thumbnail).

            pk - layer PK (int)
            overwrite - true = always generate an image, false = do not overwrite an existing image
                        note - if there isn't an existing image, one is always generated


           Signals;
              If the thumbnail URL has changed, send layer post_save() signal (i.e. search re-indexing)
              Otherwise, be quiet.

              NOTE: this will send the layer#post_save() with update_fields=["thumbnail_url"]
                      + layer#save_thumbnail() is quiet (don't send signals)
              NOTE:
                  a) when you call this the first time, the thumbnail will be default
                  b) this will create a new thumbnail
                  c) because the layer's thumbnail_url has changed, a layer#post_save() signal will be sent
                  d) the next time this is called (overwrite=true), the thumbnail will be re-generated
                  e) however, this time there will be no post_save() event because the layer's thumbnail_url is unchanged
        """

        try:
            layer = Layer.objects.get(pk=pk)

            # None => Default URL
            old_url = None
            if layer.has_thumbnail():
                old_url = layer.thumbnail_url

            new_url = self.setup_thumbnail(layer, overwrite)

            if old_url != new_url:
                # be explict about what changed
                layer.save(update_fields=['thumbnail_url'])

        except Exception as e:
            print "EXCEPTION - thumbnail generation for layer pk="+str(pk)
            print(e)
            print traceback.format_exc()
            raise e  # send forward so actual task can retry()


# ------------------------------------------------------------------------------------------------------------


# Celery-compatible task to create thumbnails using PhantomJS
class CreateStoryLayerAnimatedThumbnailTask(CreateStoryLayerThumbnailTask):
    NTIMESLICES = 10

    @staticmethod
    def choose_timeslices(timepositions, nslices):
        # if just a few slices, use all of them
        if len(timepositions) < nslices:
            return timepositions
        # otherwise, have to group timepositions

        # split into 10 sub-lists, all approx same size
        #   this uses the INDEX
        # ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] into 4 would be
        #  [array([0, 1, 2]), array([3, 4, 5]), array([6, 7]), array([8, 9])]
        chunks = numpy.array_split(numpy.array(
            xrange(0, len(timepositions))), nslices)
        # get the original data for the 1st and last value in the list
        # i.e. (From above) --> ['a/c', 'd/f', 'g/h', 'i/j']
        return [timepositions[x[0]] + "/" + timepositions[x[-1]] for x in chunks]

    # given a list of image filenames, save as an animated gif
    def create_animated_GIF(self, frame_fnames):
        gif_fname = self.create_temp_filename()
        try:
            images = []
            for fname in frame_fnames:
                images.append(Image.open(fname))

            images[0].save(gif_fname, format="GIF", save_all=True,
                           append_images=images[1:], loop=10000, duration=1000)

            with open(gif_fname, mode='rb') as file:
                imageData = file.read()
            return imageData
        finally:
            os.remove(gif_fname)  # clean up

    # override from non-animated class
    #
    # for each timeslice
    #     create a image for it
    # use PIL to create an animated GIF
    # delete all the single-timeslice gifs
    # return the animated GIF
    def create_screenshot(self, layer):
        boundingBoxWGS84, timepositions = self.retreive_WMS_metadata(
            layer.typename.encode('utf-8'))
        # cannot animate, call parent implementation
        if timepositions is None or len(timepositions) == 1:
            return CreateStoryLayerThumbnailTask.create_screenshot(self, layer)

        try:
            frame_fnames = []
            for timeslice in self.choose_timeslices(timepositions, self.NTIMESLICES):
                fname = self.create_temp_filename()
                frame_fnames.append(fname)
                args = self.create_phantomjs_args(layer.typename.encode(
                    'utf-8'), boundingBoxWGS84, fname, timeslice)
                resultCode, _out, _err = self.run_process(
                    args, env={'QT_QPA_PLATFORM': 'minimal'})
                if (resultCode != 0):
                    raise Exception('Unknown issue running PhantomJS for thumbnail generation - exit code='
                                    + str(resultCode) +
                                    " -- args: " + str(args)
                                    + "stdout:" + str(_out) + "stderr:" + str(_err))
            return self.create_animated_GIF(frame_fnames)
        finally:
            for to_delete_fname in frame_fnames:
                os.remove(to_delete_fname)  # clean up

# ------------------------------------------------------------------------------------------------------------


class CreateStoryAnimatedThumbnailTask(CreateStoryLayerAnimatedThumbnailTask):

    # given a chapter, determine the background tile_url (osm or mapbox)
    # might return None if there isn't one define (shouldn't happen based on GUI)
    @staticmethod
    def tileURL(chapter):
        # look for a visible background layer for the chapter
        background = [
            x for x in chapter.layers if x.visibility and x.group == 'background']
        # if there's no background, use the default
        if len(background) == 0:
            return "https://{a-b}.tiles.mapbox.com/v3/mapbox.world-dark/{z}/{x}/{y}.png"

        config = background[0]

        # get from actual settings file (config is slightly different!)
        config_main = [
            x for x in settings.MAP_BASELAYERS if "name" in x and x["name"] == config.name][0]

        # cf. https://wiki.openstreetmap.org/wiki/Tile_servers
        if config_main["source"]["ptype"] == "gxp_osmsource":
            if config.name == "mapnik":
                return 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            if config.name == "hot":
                return 'https://{a-b}.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png'

        # cf. https://api.tiles.mapbox.com/v3/mapbox.world-dark.jsonp?secure=1
        if config_main["source"]["ptype"] == "gxp_mapboxsource":
            return "https://{a-b}.tiles.mapbox.com/v3/mapbox." + config_main["name"] + "/{z}/{x}/{y}.png"

        raise Exception(
            "unable to determine tile URL for background layer - " + config["name"])

    # returns a list of layers
    # layer -> {name, style_name (might be ""),bounds,timeslices (might be None)}}
    @staticmethod
    def get_layer_metadata(chapter):
        result = []
        for layer in [x for x in chapter.layers if x.visibility and x.group != 'background']:
            metadata = CreateStoryLayerThumbnailTask.retreive_WMS_metadata(
                layer.name)
            style = layer.styles if layer.styles is not None else ""
            result.append({"name": layer.name, "style_name": style,
                           "bounds": metadata[0], "timeslices": metadata[1]})
        return result

    # we need to parse the timeslices (so we can do comparisons), make a list of all of them, then unique/sort them
    @staticmethod
    def combine_timeslices(layer_metadata_list):
        list_list_slices = [x["timeslices"]
                            for x in layer_metadata_list if x["timeslices"] is not None]
        # flatten list of list
        all_slices = [x for sub_list in list_list_slices for x in sub_list]
        if len(all_slices) == 0:  # all layers don't have times
            return ["NONE"]
        # parse
        all_slices = [datetime.datetime.strptime(
            x, "%Y-%m-%dT%H:%M:%S.%fZ") for x in all_slices]
        # unique and sort
        all_slices = list(sorted(set(all_slices)))
        # back to strings
        all_slices = [x.isoformat() + "Z" for x in all_slices]
        return all_slices

    # compute bounds for a list of layer metadata {"bounds":[xmin,ymin, xmax, ymax]}
    # will return [-180,-90,180,90] if there isn't any real bounds
    @staticmethod
    def combine_bounds(layer_metadata_list):
        # bounds is present and isn't null (0,0,-1,-1)
        list_bounds = [x["bounds"] for x in layer_metadata_list if
                       x["bounds"] is not None and x["bounds"][0] < x["bounds"][2]]
        # this shouldn't happen...
        if len(list_bounds) == 0:
            return [-180, -90, 180, 90]

        xmin = min([bounds[0] for bounds in list_bounds])
        ymin = min([bounds[1] for bounds in list_bounds])
        xmax = max([bounds[2] for bounds in list_bounds])
        ymax = max([bounds[3] for bounds in list_bounds])

        return [xmin, ymin, xmax, ymax]

    # create the thumbnail, given info about the layers configured for the story
    def create_thumbnail(self, layer_names, layer_styles, full_bounds, intervals, tileURL):
        try:
            frame_fnames = []
            for timeslice in intervals:
                fname = self.create_temp_filename()
                frame_fnames.append(fname)
                timeslice_by_layer = ",".join(timeslice)
                args = self.create_phantomjs_args(layer_names, full_bounds, fname, timeslice_by_layer, tileURL,
                                                  layer_styles)
                resultCode, _out, _err = self.run_process(
                    args, env={'QT_QPA_PLATFORM': 'minimal'})
                if (resultCode != 0):
                    raise Exception('Unknown issue running PhantomJS for thumbnail generation - exit code='
                                    + str(resultCode) +
                                    " -- args: " + str(args)
                                    + "stdout:" + str(_out) + "stderr:" + str(_err))
            return self.create_animated_GIF(frame_fnames)
        finally:
            for to_delete_fname in frame_fnames:
                os.remove(to_delete_fname)  # clean up

    # returns a list, the same length as intervals
    # each item in the result is a list the same length as the # of layers
    #
    # if all the layers are simple, then this will just replicate the same interval for each layer
    # i.e. if intervals = [a,b,c] and there are 2 layers -->
    #    [  [a,a], [b,b], [c,c] ]
    #
    # however, if the layermetadata indicates there isn't timeslices for that layer, then
    # its corresponding interval will be "NONE"  For example,
    # if intervals = [a,b,c] and there are 3 layers, with the 2nd layer having no timeslices, -->
    # [  [a,NONE,a], [b,NONE,b], [c,NONE,c] ]
    @staticmethod
    def create_layers_intervals(intervals, layer_metadatas):
        result = []  # one for each frame in animation (len(intervals))
        for interval in intervals:
            item = []  # one for each layer in the story
            for layer_metadata in layer_metadatas:
                value = "NONE" if layer_metadata['timeslices'] is None else interval
                item.append(value)
            result.append(item)
        return result

    # for testing - get all the info required for a thumbnail, and return in a dic
    # "intervals_by_layer" -- list of list, one for each frame and one for each layer
    # "layer_names" -- comma separated string with the names of the layers
    # "layer_styles" -- comma separated string wih the names of the style (maybe "")
    # "full_bounds" -- viewport
    # "tile_URL" -- basemap XYZ tile URL
    # "playback_type" -- unused (UI only allows instant)
    @staticmethod
    def get_all_thumbnail_info(chapter):
        # note - currently only "Instant" is possible}
        result = {"playback_type": chapter.viewer_playbackmode}
        layer_metadata = CreateStoryAnimatedThumbnailTask.get_layer_metadata(
            chapter)
        if len(layer_metadata) == 0:
            return None  # cannot compute
        result["tile_URL"] = CreateStoryAnimatedThumbnailTask.tileURL(chapter)

        combined_timeslices = CreateStoryAnimatedThumbnailTask.combine_timeslices(
            layer_metadata)
        intervals = CreateStoryAnimatedThumbnailTask.choose_timeslices(combined_timeslices,
                                                                       CreateStoryAnimatedThumbnailTask.NTIMESLICES)
        result["intervals_by_layer"] = CreateStoryAnimatedThumbnailTask.create_layers_intervals(intervals,
                                                                                                layer_metadata)

        result["full_bounds"] = CreateStoryAnimatedThumbnailTask.combine_bounds(
            layer_metadata)
        result["layer_names"] = ",".join([x["name"] for x in layer_metadata])
        result["layer_styles"] = ",".join(
            [x["style_name"] for x in layer_metadata])
        return result

    # create a thumbnail given the info dictionary (cf get_all_thumbnail_info)
    def create_thumbnail_from_info(self, thumbnail_info):
        thumbnail = self.create_thumbnail(thumbnail_info["layer_names"],
                                          thumbnail_info["layer_styles"],
                                          thumbnail_info["full_bounds"],
                                          thumbnail_info["intervals_by_layer"],
                                          thumbnail_info["tile_URL"])
        return thumbnail

    # update the story's thumbnail
    def update_thumbnail(self, mapstory):
        if len(mapstory.chapters) == 0:
            self.set_layer_thumbnail_default(
                mapstory)  # no chapters, no thumbnail
            return None

        chapter = mapstory.chapters[0]  # mapstory.mapstories.models.Map

        thumbnail_info = self.get_all_thumbnail_info(chapter)
        if thumbnail_info is None:
            # no active layers, no thumbnail
            self.set_layer_thumbnail_default(mapstory)
            return None

        thumbnail = self.create_thumbnail_from_info(thumbnail_info)

        finalFname = self.get_official_thumbnail_name(mapstory)
        mapstory.save_thumbnail(finalFname, thumbnail)
        return mapstory.thumbnail_url

    def run(self, pk, overwrite=True):
        try:
            mapstory = MapStory.objects.get(pk=pk)

            # None => Default URL
            old_url = None
            if mapstory.has_thumbnail():
                old_url = mapstory.thumbnail_url

            new_url = self.update_thumbnail(mapstory)

            if old_url != new_url:
                # be explict about what changed
                mapstory.save(update_fields=['thumbnail_url'])

        except Exception as e:
            print "EXCEPTION - thumbnail generation for story pk=" + str(pk)
            print(e)
            print traceback.format_exc()
            raise e  # send forward so actual task can retry()


@app.task(bind=True)
def task_CreateStoryLayerAnimatedThumbnailTask(self, pk, overwrite=False):
    try:
        worker = CreateStoryLayerAnimatedThumbnailTask()
        worker.run(pk, overwrite)
        return "pk=" + str(pk)
    except Exception:
        self.retry(max_retries=5, countdown=31)


@app.task(bind=True)
def task_CreateStoryAnimatedThumbnailTask(self, pk, overwrite=False):
    try:
        worker = CreateStoryAnimatedThumbnailTask()
        worker.run(pk, overwrite)
        return "pk=" + str(pk)
    except Exception:
        self.retry(max_retries=5, countdown=31)


############################################################################################

# convenience method (used by geonode) to start (via celery) the
# thumbnail generation task.
# this version is transaction aware -- it will schedule when the
# current transaction is committed...
def create_gs_thumbnail_mapstory_tx_aware(instance, overwrite):
    # if this is a map (i.e. multiple layers), handoff to original implementation
    if instance.class_name == 'Map':
        return create_gs_thumbnail_geonode(instance, overwrite)
    # because layer hasn't actually been committed yet, we don't create the thumbnail until the transaction commits
    # if the task were to run now, it wouldnt be able to retreive layer from the database
    connection.on_commit(lambda: run_task(instance.pk, overwrite))
    # if you get an error here, it probably means you aren't using the transaction_hooks proxy DB type
    # cf https://django-transaction-hooks.readthedocs.io/en/latest/


# run the actual task
def run_task(pk, overwrite):
    task_CreateStoryLayerAnimatedThumbnailTask.delay(pk, overwrite=overwrite)


# --------------------------


# call this to schedule a mapstory story thumbnail (wait until current tx finishes)
def create_mapstory_thumbnail_tx_aware(instance, overwrite):
    connection.on_commit(lambda: run_task_story(instance.pk, overwrite))


# run the actual task
def run_task_story(pk, overwrite):
    task_CreateStoryAnimatedThumbnailTask.delay(pk, overwrite=overwrite)
