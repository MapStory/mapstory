
from celery import Task

from django.db import connection

import subprocess
import traceback
import os

from geonode.base.models import Link
from geonode.geoserver.helpers import create_gs_thumbnail_geonode
from owslib.wms import WebMapService
from lxml import etree
from geonode.layers.models import Layer
from django.conf import settings
from tempfile import NamedTemporaryFile
import math
import logging
import httplib2
from urlparse import urlparse

# Celery-compatible task to create thumbnails using PhantomJS
class CreateStoryLayerThumbnailTask(Task):
    """This creates a thumbnail using PhantomJS"""

    # location of the phantomJS files
    phantomjs_file = os.path.join(os.path.dirname(__file__), 'thumbnail_storylayer.js')
    # phantomjs_html = os.path.join(os.path.dirname(__file__), 'thumnail_storylayer.html')
    phantomjs_html = settings.SITEURL + settings.STATIC_URL + "thumbnails/static/thumbnail_storylayer.html"

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

        p = subprocess.Popen(args, env=process_env, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        out, err = p.communicate()
        result = p.poll()

        logging.debug("command result - " + str(result))

        return result, out, err  # None if fail

    # add geoserver user/password to a request
    def request_geoserver_with_credentials(self, url):
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
        layername = layer.typename.encode('utf-8')

        url = settings.OGC_SERVER['default']['LOCATION'] + "geonode/"  # workspace is hard-coded in the importer
        url += layername + "/wfs?request=GetFeature&maxfeatures=1&request=GetFeature&typename=geonode%3A" + layername + "&version=1.1.0"

        feats = self.request_geoserver_with_credentials(url)
        root = etree.fromstring(feats)

        nfeatures = root.attrib['numberOfFeatures']
        return nfeatures == "1"

    # returns:
    #  bounding_box, timepositions = retreive_WMS_metadata(...)
    # bounding box = [xmin, ymin, xmax, ymax]
    # timepositions = list of dates (string)
    def retreive_WMS_metadata(self, layer):
        layername = layer.typename.encode('utf-8')
        url = settings.OGC_SERVER['default']['LOCATION'] + "geonode/"  # workspace is hard-coded in the importer
        url += layername + "/wms?request=GetCapabilities&version=1.1.1"

        get_cap_data= self.request_geoserver_with_credentials(url)
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
    def create_phantomjs_args(self, layer, tempfname):
        boundingBoxWGS84, timepositions = self.retreive_WMS_metadata(layer)

        wms = settings.OGC_SERVER['default']['PUBLIC_LOCATION'] + "geonode/wms"
        layerName = layer.typename.encode('utf-8')
        xmin = boundingBoxWGS84[0]
        ymin = boundingBoxWGS84[1]
        xmax = boundingBoxWGS84[2]
        ymax = boundingBoxWGS84[3]

        time = "ALL"  # entire dataset (all times)
        if timepositions is None:
            time = "NONE"  # this is a time-less dataset, don't request time-limited data

        args = ["phantomjs",
                "--ignore-ssl-errors=true",
                "--web-security=false",
                CreateStoryLayerThumbnailTask.phantomjs_file,
                CreateStoryLayerThumbnailTask.phantomjs_html,
                wms,
                layerName,
                xmin, ymin, xmax, ymax,
                time,
                tempfname,
                "False"]  # we capture output, so never be quiet
        args = [str(arg) for arg in args]  # convert numbers to string

        return args

    # get a temporary filename (don't forget to delete it when done)
    def create_temp_filename(self, filename_suffix='image'):
        file = NamedTemporaryFile(delete=False, prefix="temp_thumbnail_", suffix=filename_suffix)
        fname = file.name
        file.close()
        return fname

    # call phantomjs and save the thumbnail
    # return - image data
    def create_screenshot(self, layer):
        fname = self.create_temp_filename()
        try:
            args = self.create_phantomjs_args(layer, fname)
            resultCode, _out, _err = self.run_process(args, env={'QT_QPA_PLATFORM': 'minimal'})
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
                layer.save(update_fields=['thumbnail_url'])  # be explict about what changed

        except Exception as e:
            print "EXCEPTION - thumbnail generation"
            print(e)
            print traceback.format_exc()
            self.retry(max_retries=5, countdown=31) # retry in 31 seconds (auth cache timeout)

# convenience method (used by geonode) to start (via celery) the
# thumbnail generation task.
def create_gs_thumbnail_mapstory(instance, overwrite):
    # if this is a map (i.e. multiple layers), handoff to original implementation
    if instance.class_name == 'Map':
        return create_gs_thumbnail_geonode(instance, overwrite)
    task = CreateStoryLayerThumbnailTask()
    task.delay(instance.pk, overwrite=overwrite)

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
    connection.on_commit(lambda: run_task(instance.pk,overwrite))
    # if you get an error here, it probably means you aren't using the transaction_hooks proxy DB type
    # cf https://django-transaction-hooks.readthedocs.io/en/latest/

# run the actual task
def run_task(pk,overwrite):
    task = CreateStoryLayerThumbnailTask()
    task.delay(pk, overwrite=overwrite)
