import contextlib
import csv
import json
import logging
import os
import re
import shutil
import io
import tempfile
import traceback
import uuid
import zipfile

import requests
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib.gis.geos import GEOSGeometry
from django.urls import reverse
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render, render_to_response
from django.template import RequestContext
from django.template.response import TemplateResponse
from django.utils.translation import ugettext as _
from requests import Request

import ogr
import pandas
from celery.exceptions import TimeoutError
from geonode import geoserver
from geonode.base.models import TopicCategory
from geonode.documents.models import get_related_documents
from geonode.geoserver.helpers import gs_catalog, ogc_server_settings
from geonode.geoserver.views import layer_acls, resolve_user
from geonode.groups.models import GroupProfile
from geonode.layers.models import Dataset
from geonode.layers.tasks import delete_layer
from geonode.layers.views import (_PERMISSION_MSG_DELETE, _PERMISSION_MSG_VIEW,
                                  _resolve_layer)
from geonode.security.views import _perms_info_json
from geonode.utils import (GXPLayer, GXPMap, bbox_to_projection,
                           build_social_links, check_ogc_backend,
                           default_map_config)
from guardian.shortcuts import get_perms
from lxml import etree
from mapstory.forms import DistributionUrlForm, KeywordsForm, MetadataForm
from mapstory.importers import GeoServerLayerCreator
from mapstory.initiatives.models import InitiativeMembership
from mapstory.mapstories.models import Map
from mapstory.models import Baselayer, BaselayerDefault
from mapstory.organizations.models import OrganizationMembership
from mapstory.utils import has_exception, parse_wfst_response, print_exception
from owslib.feature.schema import get_schema

logger = logging.getLogger("geonode.layers.views")


@login_required
def layer_create(request, template='upload/layer_create.html'):
    if request.method == 'POST':
        errors = False
        error_messages = []

        if request.is_ajax():
            configuration_options = json.loads(request.body)
        else:
            configuration_options = request.POST
            if isinstance(configuration_options.get('featureType', {}), str) \
                    or isinstance(configuration_options.get('featureType', {}), str):
                configuration_options['featureType'] = json.loads(
                    configuration_options['featureType'])

        if not configuration_options.get('layer_owner'):
            configuration_options['layer_owner'] = request.user

        if configuration_options['featureType'].get('editable') is True:
            configuration_options['storeCreateGeogig'] = True

        store_name = '{0}-layers'.format(request.user.username.lower())
        configuration_options['featureType']['store']['name'] = store_name

        # Launder the name of each attribute to ensure that there's no spaces or special characters,
        # as they will break the functionality of adding and editing features.
        # for attribute in configuration_options['featureType']['attributes']['attribute']:
        #     attribute['name'] = launder(attribute['name'])

        creator = GeoServerLayerCreator()
        try:
            layers = creator.handle(
                configuration_options=configuration_options)

        if request.is_ajax():
            if errors:
                return HttpResponse(json.dumps({'status': 'failure', 'errors': error_messages}), status=400,
                                    content_type='application/json')
            if layers:
                layer_names = [{'name': layer.name, 'url': layer.get_absolute_url()} for layer in Dataset.objects.filter(name__in=[n[0] for n in layers])]

                return HttpResponse(json.dumps({'status': 'success', 'layers': layer_names}), status=201,
                                    content_type='application/json')

    return render_to_response(template, RequestContext(request, {}))


def layer_append_minimal(source, target, request_cookies):
    """
    The main layer_append logic that can run outside of a request.
    """
    source = 'geonode:' + source

    def chunk_list(list, chunk_size):
        """Yield successive chunk_size chunks from list."""
        for i in range(0, len(list), chunk_size):
            yield list[i:i+chunk_size]

    # TODO: use the provided column to decide which features should be updated and which should be created
    # join_on_attribute = json.loads(request.POST.get(u'joinOnAttributeName', 'false'))

    get_features_request = requests.post(
        '{}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames={}'.format(ogc_server_settings.public_url,
                                                                                  source),
        auth=ogc_server_settings.credentials
    )

    if has_exception(get_features_request.content):
        raise AssertionError(
            'Failed to get features from source layer: {0}'.format(source))

    # the response to getfeatures will look like the following. We want everything between first <wfs:member> and last </wfs:member>
    # <wfs:FeatureCollection ...>
    #     <wfs:member>
    #         <geonode:a3 gml:id="a3.4">
    #             <geonode:geometry>
    #                 <gml:Point srsDimension="2" srsName="urn:ogc:def:crs:EPSG::4326">
    #                     <gml:pos>14.101186235070415 -87.19960869178765</gml:pos>
    #                 </gml:Point>
    #             </geonode:geometry>
    #         </geonode:a3>
    #     </wfs:member>
    #     ...
    #     <wfs:member>
    #         ...
    #     </wfs:member>
    # </wfs:FeatureCollection>

    # Create the xml containing all the features that need to be posted. Need to get the features form the source
    # layer, update them so that they get posted to the destination layer
    xml = etree.XML(get_features_request.content)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    for ns in root.nsmap:
        xpath_ns = etree.FunctionNamespace(root.nsmap[ns])
        xpath_ns.prefix = ns
    members = tree.xpath('//wfs:FeatureCollection/wfs:member')
    members_str = []
    for m in members:
        # replace the tag <workspace>:<layer_destination> with <workspace>:<layer_source>
        tokens = target.split(':')
        layername_element = m.find(source, root.nsmap)
        layername_element.tag = '{' + root.nsmap[tokens[0]] + '}' + tokens[1]
        members_str.append(etree.tostring(m))

    # divide the features (members_str) into chunks so that we can have a progress indicator
    features_per_chunk = 750
    features_chunks = chunk_list(members_str, features_per_chunk)

    # example of transactions can be found at:
    # https://github.com/highsource/ogc-schemas/tree/2.0.0/schemas/src/main/resources/ogc/wfs/2.0/examples
    wfst_insert_template = ' '.join((
        '<?xml version="1.0" encoding="utf-8"?>',
        '<wfs:Transaction',
        'service="WFS"',
        'version="2.0.0"',
        'xmlns:{workspace}="{workspace_uri}"',
        'xmlns:gml="http://www.opengis.net/gml/3.2"',
        'xmlns:wfs="http://www.opengis.net/wfs/2.0"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        'handle="{handle}"',
        'xsi:schemaLocation="',
        'http://www.opengis.net/wfs/2.0',
        'http://schemas.opengis.net/wfs/2.0/wfs.xsd',
        'http://www.opengis.net/gml/3.2',
        'http://schemas.opengis.net/gml/3.2.1/gml.xsd">',
        '<wfs:Insert>',
        '{features}',
        '</wfs:Insert>',
        '</wfs:Transaction>'
    ))

    summary_aggregate = []
    summary = None
    for features in features_chunks:
        handle = 'added {0} features to {1} via append'.format(
            len(features), target)
        wfs_transaction_payload = wfst_insert_template.format(features=''.join(features), workspace='geonode',
                                                              workspace_uri='http://www.geonode.org/', handle=handle)
        insert_features_request = requests.post(
            '{}/wfs/WfsDispatcher'.format(ogc_server_settings.public_url),
            cookies=request_cookies,
            headers={'Content-Type': 'application/xml'},
            data=wfs_transaction_payload
        )

        if has_exception(insert_features_request.content) is False:
            print_exception(insert_features_request.content)
        else:
            summary = parse_wfst_response(insert_features_request.content)
            summary_aggregate.append(summary)

    return summary_aggregate


def download_append_csv(request):

    # Retrieve the CSV and save it in a variable
    csv_url = request.session['csv_link'].lower()
    csv_name = '{}.csv'.format(request.session['csv_name'])
    original_csv = pandas.read_csv(csv_url)
    fieldnames = [fieldname.lower()
                  for fieldname in original_csv.columns.values.tolist()]

    # Remove the FID and OGC_FID fields
    if 'fid' in fieldnames:
        fieldnames.remove('fid')
    if 'ogc_fid' in fieldnames:
        fieldnames.remove('ogc_fid')
    # Create the new CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename={}'.format(
        csv_name)
    writer = csv.writer(response)
    writer.writerow(fieldnames)

    # Return the CSV as an HTTP Response for the user to download
    return response


@contextlib.contextmanager
def temporary_directory(*args, **kwargs):
    """
    A context manager that allows us to create a temporary directory
    that will be cleaned up after it's no longer being used.
    """
    tempdir = tempfile.mkdtemp(*args, **kwargs)
    try:
        yield tempdir
    finally:
        shutil.rmtree(tempdir)


def download_append_shp(request):
    """
    This function grabs a zipped shapefile from a WFS request, and removes
    the fields that are unnecessary for appending data to that layer.
    """

    # Create a temporary directory that is removed after the user downloads the zipfile.
    with temporary_directory() as tempdir:

        shp_url = request.session['shp_link'].lower()
        shp_name = '{}.zip'.format(request.session['shp_name'])

        # Download the zip file to a temporary directory.
        shapefile_request = requests.get(shp_url)
        with open(os.path.join(tempdir, shp_name), "wb") as code:
            code.write(shapefile_request.content)

        # Extract the zip file to a temporary directory.
        original_zipfile = zipfile.ZipFile("{}/{}".format(tempdir, shp_name))
        original_zipfile.extractall(tempdir)

        # Remove the zip file after we've extracted it.
        os.remove("{}/{}".format(tempdir, shp_name))

        # Find the shapefile (.shp) and set it's name to a variable for later use.
        for root, dirs, files in os.walk(tempdir):
            for file in files:
                if file.endswith(".shp"):
                    shapefile_name = file
                    table_name = shapefile_name.rsplit('.', 1)[0]
                    break

        # Read the shapefile and it's attributes.
        data_source = ogr.Open(os.path.join(tempdir, shapefile_name), True)
        data_layer = data_source.GetLayer(0)
        layer_definition = data_layer.GetLayerDefn()
        field_list = []

        for i in range(layer_definition.GetFieldCount()):
            field_list.append(
                layer_definition.GetFieldDefn(i).GetName().lower())

        # Remove the FID and OGC_FID attributes
        if 'ogc_fid' in field_list:
            data_source.ExecuteSQL(
                'ALTER TABLE {} DROP COLUMN ogc_fid'.format(table_name))
        if 'fid' in field_list:
            data_source.ExecuteSQL(
                'ALTER TABLE {} DROP COLUMN fid'.format(table_name))

        # Open StringIO to grab in-memory ZIP contents and write the new zipfile.
        in_memory_contents = io.StringIO()

        new_zipfile = zipfile.ZipFile(
            in_memory_contents, "w", compression=zipfile.ZIP_DEFLATED)
        for dirname, subdirs, files in os.walk(tempdir):
            for filename in files:
                new_zipfile.write(os.path.join(
                    dirname, filename), os.path.basename(filename))
        new_zipfile.close()

        # Grab ZIP file from in-memory, make response with correct MIME-type
        response = HttpResponse(
            in_memory_contents.getvalue(), content_type="application/zip")
        # ..and correct content-disposition.
        response['Content-Disposition'] = 'attachment; filename=%s' % shp_name

        # Return the HttpResponse (zipfile) to the user for download.
        return response


def layer_detail(request, layername, template='layers/layer_detail.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.view_resourcebase',
        _PERMISSION_MSG_VIEW)

    # assert False, str(layer_bbox)
    config = layer.attribute_config()

    # Add required parameters for GXP lazy-loading
    layer_bbox = layer.bbox[0:4]
    bbox = layer_bbox[:]
    bbox[0] = float(layer_bbox[0])
    bbox[1] = float(layer_bbox[2])
    bbox[2] = float(layer_bbox[1])
    bbox[3] = float(layer_bbox[3])

    def decimal_encode(bbox):
        import decimal
        _bbox = []
        for o in [float(coord) for coord in bbox]:
            if isinstance(o, decimal.Decimal):
                o = (str(o) for o in [o])
            _bbox.append(o)
        # Must be in the form : [x0, x1, y0, y1
        return [_bbox[0], _bbox[2], _bbox[1], _bbox[3]]

    def sld_definition(style):
        from urllib.parse import quote
        _sld = {
            "title": style.sld_title or style.name,
            "legend": {
                "height": "40",
                "width": "22",
                "href": layer.ows_url +
                "?service=wms&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" +
                quote(layer.service_typename, safe=''),
                "format": "image/png"
            },
            "name": style.name
        }
        return _sld

    if hasattr(layer, 'srid'):
        config['crs'] = {
            'type': 'name',
            'properties': layer.srid
        }
    # Add required parameters for GXP lazy-loading
    attribution = "%s %s" % (layer.owner.first_name,
                             layer.owner.last_name) if layer.owner.first_name or layer.owner.last_name else str(
        layer.owner)
    srs = getattr(settings, 'DEFAULT_MAP_CRS', 'EPSG:3857')
    srs_srid = int(srs.split(":")[1]) if srs != "EPSG:900913" else 3857
    config["attribution"] = "<span class='gx-attribution-title'>%s</span>" % attribution
    config["format"] = getattr(
        settings, 'DEFAULT_LAYER_FORMAT', 'image/png')
    config["title"] = layer.title
    config["wrapDateLine"] = True
    config["visibility"] = True
    config["srs"] = srs
    config["bbox"] = decimal_encode(
        bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                           target_srid=int(srs.split(":")[1]))[:4])

    config["capability"] = {
        "abstract": layer.abstract,
        "name": layer.alternate,
        "title": layer.title,
        "queryable": True,
        "storeType": layer.storeType,
        "bbox": {
            layer.srid: {
                "srs": layer.srid,
                "bbox": decimal_encode(bbox)
            },
            srs: {
                "srs": srs,
                "bbox": decimal_encode(
                    bbox_to_projection([float(coord) for coord in layer_bbox] + [layer.srid, ],
                                       target_srid=srs_srid)[:4])
            },
            "EPSG:4326": {
                "srs": "EPSG:4326",
                "bbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
                decimal_encode(bbox_to_projection(
                    [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
            },
            "EPSG:900913": {
                "srs": "EPSG:900913",
                "bbox": decimal_encode(bbox) if layer.srid == 'EPSG:900913' else
                decimal_encode(bbox_to_projection(
                    [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=3857)[:4])
            }
        },
        "srs": {
            srs: True
        },
        "formats": ["image/png", "application/atom xml", "application/atom+xml", "application/json;type=utfgrid",
                    "application/openlayers", "application/pdf", "application/rss xml", "application/rss+xml",
                    "application/vnd.google-earth.kml", "application/vnd.google-earth.kml xml",
                    "application/vnd.google-earth.kml+xml", "application/vnd.google-earth.kml+xml;mode=networklink",
                    "application/vnd.google-earth.kmz", "application/vnd.google-earth.kmz xml",
                    "application/vnd.google-earth.kmz+xml", "application/vnd.google-earth.kmz;mode=networklink",
                    "atom", "image/geotiff", "image/geotiff8", "image/gif", "image/gif;subtype=animated",
                    "image/jpeg", "image/png8", "image/png; mode=8bit", "image/svg", "image/svg xml",
                    "image/svg+xml", "image/tiff", "image/tiff8", "image/vnd.jpeg-png",
                    "kml", "kmz", "openlayers", "rss", "text/html; subtype=openlayers", "utfgrid"],
        "attribution": {
            "title": attribution
        },
        "infoFormats": ["text/plain", "application/vnd.ogc.gml", "text/xml", "application/vnd.ogc.gml/3.1.1",
                        "text/xml; subtype=gml/3.1.1", "text/html", "application/json"],
        "styles": [sld_definition(s) for s in layer.styles.all()],
        "prefix": layer.alternate.split(":")[0] if ":" in layer.alternate else "",
        "keywords": [k.name for k in layer.keywords.all()] if layer.keywords else [],
        "llbbox": decimal_encode(bbox) if layer.srid == 'EPSG:4326' else
        decimal_encode(bbox_to_projection(
            [float(coord) for coord in layer_bbox] + [layer.srid, ], target_srid=4326)[:4])
    }

    all_times = None
    if check_ogc_backend(geoserver.BACKEND_PACKAGE):
        from geonode.geoserver.views import get_capabilities
        workspace, layername = layer.alternate.split(
            ":") if ":" in layer.alternate else (None, layer.alternate)
        # WARNING Please make sure to have enabled DJANGO CACHE as per
        # https://docs.djangoproject.com/en/2.0/topics/cache/#filesystem-caching
        wms_capabilities_resp = get_capabilities(
            request, layer.id, tolerant=True)
        if wms_capabilities_resp.status_code >= 200 and wms_capabilities_resp.status_code < 400:
            wms_capabilities = wms_capabilities_resp.getvalue()
            if wms_capabilities:
                import xml.etree.ElementTree as ET
                e = ET.fromstring(wms_capabilities)
                for atype in e.findall(
                        "./[Name='%s']/Extent[@name='time']" % (layername)):
                    dim_name = atype.get('name')
                    if dim_name:
                        dim_name = str(dim_name).lower()
                        if dim_name == 'time':
                            dim_values = atype.text
                            if dim_values:
                                all_times = dim_values.split(",")
                                break
        if all_times:
            config["capability"]["dimensions"] = {
                "time": {
                    "name": "time",
                    "units": "ISO8601",
                    "unitsymbol": None,
                    "nearestVal": False,
                    "multipleVal": False,
                    "current": False,
                    "default": "current",
                    "values": all_times
                }
            }

    if layer.storeType == "remoteStore":
        service = layer.remote_service
        source_params = {}
        if service.type in ('REST_MAP', 'REST_IMG'):
            source_params = {
                "ptype": service.ptype,
                "remote": True,
                "url": service.service_url,
                "name": service.name,
                "title": "[R] %s" % service.title}
        maplayer = GXPLayer(
            name=layer.alternate,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config),
            source_params=json.dumps(source_params)
        )
    else:
        maplayer = GXPLayer(
            name=layer.alternate,
            ows_url=layer.ows_url,
            layer_params=json.dumps(config)
        )

    # Update count for popularity ranking,
    # but do not includes admins or resource owners
    layer.view_count_up(request.user)

    # center/zoom don't matter; the viewer will center on the layer bounds
    map_obj = GXPMap(
        sender=Dataset,
        projection=getattr(
            settings,
            'DEFAULT_MAP_CRS',
            'EPSG:3857'))

    NON_WMS_BASE_LAYERS = [
        la for la in default_map_config(request)[1] if la.ows_url is None]

    metadata = layer.link_set.metadata().filter(
        name__in=settings.DOWNLOAD_FORMATS_METADATA)

    granules = None
    all_granules = None
    all_times = None
    filter = None
    if layer.is_mosaic:
        try:
            cat = gs_catalog
            cat._cache.clear()
            store = cat.get_store(layer.name)
            coverages = cat.mosaic_coverages(store)

            filter = None
            try:
                if request.GET["filter"]:
                    filter = request.GET["filter"]
            except BaseException:
                pass

            offset = 10 * (request.page - 1)
            granules = cat.mosaic_granules(
                coverages['coverages']['coverage'][0]['name'],
                store,
                limit=10,
                offset=offset,
                filter=filter)
            all_granules = cat.mosaic_granules(
                coverages['coverages']['coverage'][0]['name'], store, filter=filter)
        except BaseException:
            granules = {"features": []}
            all_granules = {"features": []}

    if check_ogc_backend(geoserver.BACKEND_PACKAGE):
        from geonode.geoserver.views import get_capabilities
        workspace, layername = layer.alternate.split(
            ":") if ":" in layer.alternate else (None, layer.alternate)
        # WARNING Please make sure to have enabled DJANGO CACHE as per
        # https://docs.djangoproject.com/en/2.0/topics/cache/#filesystem-caching
        wms_capabilities_resp = get_capabilities(
            request, layer.id, tolerant=True)
        if wms_capabilities_resp.status_code >= 200 and wms_capabilities_resp.status_code < 400:
            wms_capabilities = wms_capabilities_resp.getvalue()
            if wms_capabilities:
                import xml.etree.ElementTree as ET
                e = ET.fromstring(wms_capabilities)
                for atype in e.findall(
                        "./[Name='%s']/Extent[@name='time']" % (layername)):
                    dim_name = atype.get('name')
                    if dim_name:
                        dim_name = str(dim_name).lower()
                        if dim_name == 'time':
                            dim_values = atype.text
                            if dim_values:
                                all_times = dim_values.split(",")
                                break

    group = None
    if layer.group:
        try:
            group = GroupProfile.objects.get(slug=layer.group.name)
        except GroupProfile.DoesNotExist:
            group = None
    # a flag to be used for qgis server
    show_popup = False
    if 'show_popup' in request.GET and request.GET["show_popup"]:
        show_popup = True

    ###
    # MapStory Specific Changes
    ###
    keywords = json.dumps([tag.name for tag in layer.keywords.all()])

    if request.method == "POST":
        keywords_form = KeywordsForm(request.POST, instance=layer)
        metadata_form = MetadataForm(instance=layer)
        distributionurl_form = DistributionUrlForm(
            request.POST, instance=layer)
        if 'keywords' in request.POST:
            if keywords_form.is_valid():
                keywords_form.save()
                new_keywords = keywords_form.cleaned_data['keywords']
                layer.keywords.set(*new_keywords)
                layer.save()
            metadata_form = MetadataForm(instance=layer)
        elif 'title' in request.POST:
            metadata_form = MetadataForm(request.POST, instance=layer)
            if metadata_form.is_valid():
                metadata_form.save()
                # update all the metadata
                if metadata_form.cleaned_data['category'] is not None:
                    new_category = TopicCategory.objects.get(
                        id=metadata_form.cleaned_data['category'].id)
                    Dataset.objects.filter(id=layer.id).update(
                        category=new_category)
                layer.title = metadata_form.cleaned_data['title']
                layer.language = metadata_form.cleaned_data['language']
                layer.data_quality_statement = metadata_form.cleaned_data['data_quality_statement']
                layer.purpose = metadata_form.cleaned_data['purpose']
                layer.is_published = metadata_form.cleaned_data['is_published']
                layer.save()
        if distributionurl_form.is_valid():
            layer.distribution_url = distributionurl_form.cleaned_data['distribution_url']

            keywords_form = KeywordsForm(instance=layer)
        if 'add_keyword' in request.POST:
            layer.keywords.add(request.POST['add_keyword'])
            layer.save()
        if 'remove_keyword' in request.POST:
            layer.keywords.remove(request.POST['remove_keyword'])
            layer.save()
    else:
        keywords_form = KeywordsForm(instance=layer)
        metadata_form = MetadataForm(instance=layer)
        distributionurl_form = DistributionUrlForm(instance=layer)

    content_moderators = Group.objects.filter(name='content_moderator').first()

    thumbnail = layer.get_thumbnail_url

    # This will get URL encoded later and is used for the social media share URL
    share_url = "https://%s/layers/%s" % (request.get_host(), layer.typename)
    share_title = "%s by %s." % (layer.title, layer.owner)
    share_description = layer.abstract

    # Get membership buttons ready:
    admin_memberships = []
    # Check if user is admin in one of those organizations
    users_org_memberships = OrganizationMembership.objects.filter(
        user_id=request.user.pk)
    for membership in users_org_memberships.all():
        # We have permission if we own the layer, or if we are an organization's admin.
        if (layer.owner == request.user) or membership.is_admin:
            admin_memberships.append(membership)

    if len(admin_memberships) < 1:
        admin_memberships = None

    ini_memberships = []
    # Checks if user is admin for Inititives
    user_ini_memberships = InitiativeMembership.objects.filter(
        user_id=request.user.pk)
    for membership in user_ini_memberships.all():
        if(layer.owner == request.user) or membership.is_admin:
            ini_memberships.append(membership)

    if len(ini_memberships) < 1:
        ini_memberships = None

    shapefile_link = layer.link_set.download().filter(mime='SHAPE-ZIP').first()
    if shapefile_link is not None:
        shapefile_link = shapefile_link.url + '&featureID=fakeID' + '&maxFeatures=1'
        request.session['shp_name'] = layer.typename
        request.session['shp_link'] = shapefile_link

    csv_link = layer.link_set.download().filter(mime='csv').first()
    if csv_link is not None:
        csv_link = csv_link.url + '&featureID=fakeID' + '&maxFeatures=1'
        request.session['csv_name'] = layer.typename
        request.session['csv_link'] = csv_link

    ###
    # End MapStory Specific Changes
    ###

    context_dict = {
        'resource': layer,
        'group': group,
        'perms_list': get_perms(request.user, layer.get_self_resource()),
        "permissions_json": _perms_info_json(layer),
        "documents": get_related_documents(layer),
        "metadata": metadata,
        "is_layer": True,
        "wps_enabled": settings.OGC_SERVER['default']['WPS_ENABLED'],
        "granules": granules,
        "all_granules": all_granules,
        "all_times": all_times,
        "show_popup": show_popup,
        "filter": filter,
        "storeType": layer.storeType,
        # MapStory Specific Additions
        "keywords": keywords,
        "keywords_form": keywords_form,
        "metadata_form": metadata_form,
        "distributionurl_form": distributionurl_form,
        "content_moderators": content_moderators,
        "thumbnail": thumbnail,
        "share_url": share_url,
        "share_title": share_title,
        "share_description": share_description,
        "organizations": admin_memberships,
        "initiatives": ini_memberships,
        "layers": json.dumps({"defaultLayer": BaselayerDefault.objects.first().dataset.name,
                              "layers":  [x.to_object() for x in Baselayer.objects.all()]})
        # "online": (layer.remote_service.probe == 200) if layer.storeType == "remoteStore" else True
    }

    if request and 'access_token' in request.session:
        access_token = request.session['access_token']
    else:
        u = uuid.uuid1()
        access_token = u.hex

    context_dict["viewer"] = json.dumps(map_obj.viewer_json(
        request, * (NON_WMS_BASE_LAYERS + [maplayer])))
    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    context_dict["crs"] = getattr(
        settings,
        'DEFAULT_MAP_CRS',
        'EPSG:3857')

    # provide bbox in EPSG:4326 for leaflet
    if context_dict["preview"] == 'leaflet':
        srid, wkt = layer.geographic_bounding_box.split(';')
        srid = re.findall(r'\d+', srid)
        geom = GEOSGeometry(wkt, srid=int(srid[0]))
        geom.transform(4326)
        context_dict["layer_bbox"] = ','.join([str(c) for c in geom.extent])

    if layer.storeType == 'dataStore':
        links = layer.link_set.download().filter(
            Q(name__in=settings.DOWNLOAD_FORMATS_VECTOR) |
            Q(link_type='original'))
    else:
        links = layer.link_set.download().filter(
            Q(name__in=settings.DOWNLOAD_FORMATS_RASTER) |
            Q(link_type='original'))
    links_view = [item for idx, item in enumerate(links) if
                  item.url and 'wms' in item.url or 'gwc' in item.url]
    links_download = [item for idx, item in enumerate(
        links) if item.url and 'wms' not in item.url and 'gwc' not in item.url]
    for item in links_view:
        if item.url and access_token and 'access_token' not in item.url:
            params = {'access_token': access_token}
            item.url = Request('GET', item.url, params=params).prepare().url
    for item in links_download:
        if item.url and access_token and 'access_token' not in item.url:
            params = {'access_token': access_token}
            item.url = Request('GET', item.url, params=params).prepare().url

    if request.user.has_perm('view_resourcebase', layer.get_self_resource()):
        context_dict["links"] = links_view
    if request.user.has_perm(
        'download_resourcebase',
            layer.get_self_resource()):
        if layer.storeType == 'dataStore':
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_VECTOR)
        else:
            links = layer.link_set.download().filter(
                name__in=settings.DOWNLOAD_FORMATS_RASTER)
        context_dict["links_download"] = links_download

    if settings.SOCIAL_ORIGINS:
        context_dict["social_links"] = build_social_links(request, layer)
    layers_names = layer.alternate
    try:
        if settings.DEFAULT_WORKSPACE and settings.DEFAULT_WORKSPACE in layers_names:
            workspace, name = layers_names.split(':', 1)
        else:
            name = layers_names
    except BaseException:
        logger.error("Can not identify workspace type and layername")

    context_dict["layer_name"] = json.dumps(layers_names)

    try:
        # get type of layer (raster or vector)
        if layer.storeType == 'coverageStore':
            context_dict["layer_type"] = "raster"
        elif layer.storeType == 'dataStore':
            if layer.has_time:
                context_dict["layer_type"] = "vector_time"
            else:
                context_dict["layer_type"] = "vector"

            location = "{location}{service}".format(** {
                'location': settings.OGC_SERVER['default']['LOCATION'],
                'service': 'wms',
            })
            # get schema for specific layer
            username = settings.OGC_SERVER['default']['USER']
            password = settings.OGC_SERVER['default']['PASSWORD']
            schema = get_schema(
                location,
                name,
                username=username,
                password=password)

            # get the name of the column which holds the geometry
            if 'the_geom' in schema['properties']:
                schema['properties'].pop('the_geom', None)
            elif 'geom' in schema['properties']:
                schema['properties'].pop("geom", None)

            # filter the schema dict based on the values of layers_attributes
            layer_attributes_schema = []
            for key in list(schema['properties'].keys()):
                layer_attributes_schema.append(key)

            filtered_attributes = layer_attributes_schema
            context_dict["schema"] = schema
            context_dict["filtered_attributes"] = filtered_attributes

    except BaseException:
        logger.error(
            "Possible error with OWSLib. Turning all available properties to string")

    # maps owned by user needed to fill the "add to existing map section" in template
    if request.user.is_authenticated():
        context_dict["maps"] = Map.objects.filter(owner=request.user)
    return TemplateResponse(
        request, template, context=context_dict)


@login_required
def layer_remove(request, layername, template='layers/layer_remove.html'):
    layer = _resolve_layer(
        request,
        layername,
        'base.delete_resourcebase',
        _PERMISSION_MSG_DELETE)

    if (request.method == 'GET'):
        return render(request, template, context={
            "layer": layer
        })
    if (request.method == 'POST'):
        try:
            with transaction.atomic():
                # Using Tastypie
                # from geonode.api.resourcebase_api import LayerResource
                # res = LayerResource()
                # request_bundle = res.build_bundle(request=request)
                # layer_bundle = res.build_bundle(request=request, obj=layer)
                # layer_json = res.serialize(None,
                #                            res.full_dehydrate(layer_bundle),
                #                            "application/json")
                # delete_layer.delay(instance=layer_json)
                result = delete_layer.delay(layer_id=layer.id)
                result.wait(10)
        except TimeoutError:
            # traceback.print_exc()
            pass
        except Exception as e:
            traceback.print_exc()
            message = '{0}: {1}.'.format(
                _('Unable to delete layer'), layer.alternate)

            if 'referenced by layer group' in getattr(e, 'message', ''):
                message = _(
                    'This layer is a member of a layer group, you must remove the layer from the group '
                    'before deleting.')

            messages.error(request, message)
            return render(
                request, template, context={"layer": layer})
        # MapStory Specific Change
        return HttpResponseRedirect(reverse("profile_detail", kwargs={'slug': layer.owner}))
        # End MapStory Specific Change
    else:
        return HttpResponse("Not allowed", status=403)


def layer_detail_id(request, layerid):
    layer = get_object_or_404(Dataset, pk=layerid)
    return layer_detail(request, layer.typename)


def layer_acls_mapstory(request):
    response = layer_acls(request)
    result = json.loads(response.content)
    result["fullname"] = request.user.username

    return HttpResponse(json.dumps(result), content_type="application/json")


def resolve_user_mapstory(request):
    response = resolve_user(request)
    result = json.loads(response.content)
    result["fullname"] = request.user.username

    return HttpResponse(json.dumps(result), content_type="application/json")


def get_remote_url(request, layername):
    layer = _resolve_layer(
        request,
        layername,
        'base.view_resourcebase',
        _PERMISSION_MSG_DELETE)

    url = None

    if layer.remote_service is not None:
        service = layer.remote_service
        url = service.online_resource

    return HttpResponse(url)
