"""
Test Utilities and helpers
"""
import string
import random
from datetime import datetime
from datetime import timedelta
from itertools import cycle
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db.models import signals
from django.utils.text import slugify

from geonode.base.models import TopicCategory
from geonode.geoserver.signals import geoserver_pre_save_maplayer
from geonode.geoserver.signals import geoserver_post_save_map, geoserver_pre_save, geoserver_post_save
from geonode.maps.models import MapLayer, Layer


from mapstory.mapstories.models import Map
from mapstory.mapstories.models import MapStory

User = get_user_model()


def get_test_user():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User
    """
    user, created = User.objects.get_or_create(
        username='modeltester', email='modeltester@models.com'
    )
    if created:
        user.set_password('glassonion232123')
        user.save()
    return user


def create_user(username, password, **kwargs):
    """
    Creates a user and saves it

    :param username: The username
    :param password: The password
    :param kwargs:  Additional parameters

    Returns:
        (username, password)
    """
    user, created = get_user_model().objects.get_or_create(username=username, **kwargs)
    user.set_password(password)
    user.save()

    return username, password


def create_admin_user(username, password):
    """
    Creates a superuser

    :param username: The username
    :param password: The password
    :return: (username, password)
    """
    return create_user(username, password, is_superuser=True)


def create_map(owner, title):
    """
    Creates a new Map

    :param owner:(User) The map's owner
    :param title: (String) The map's title
    :return:(Map) A Map model object
    """
    return Map.objects.create(owner=owner, zoom=1, center_x=0, center_y=0, title=title)


def create_mapstory(owner, title):
    """
    Cretes a new mapstory

    :param owner: The owner of the story
    :param title: The story title
    :return: MapStory
    """
    return MapStory.objects.create(owner=owner, title=title, slug=slugify(title))


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    """
    Generages a random string

    :param size: The size of the string
    :param chars: The chars to randomly select from
    :return: String
    """
    return ''.join(random.choice(chars) for _ in range(size))


def generate_testname(prefix="test", size=6, chars=string.ascii_uppercase + string.ascii_lowercase):
    """
    Generates a test name by appending a random string after the prefix

    :param prefix: Prefix string
    :param size: Size of random suffix
    :return: String
    """
    return "%s_%s" % (prefix, id_generator(size=size, chars=chars))


map_layers = [
    {
        "fixed": False,
        "group": "background",
        "layer_params": "",
        "map": 'GeoNode Default Map',
        "name": "geonode:CA",
        "ows_url": "http://localhost:8080/geoserver/wms",
        "source_params": "",
        "transparent": False,
        "stack_order": 0,
        "visibility": True,
        "opacity": 1,
    },
    {
        "fixed": True,
        "group": "background",
        "layer_params": "{\"args\": [\"bluemarble\", \"http://maps.opengeo.org/geowebcache/service/wms\", \
        {\"layers\": [\"bluemarble\"], \"tiled\": true, \"tilesOrigin\": [-20037508.34, -20037508.34],\
        \"format\": \"image/png\"}, {\"buffer\": 0}], \"type\": \"OpenLayers.Layer.WMS\"}",
        "map": 'GeoNode Default Map',
        "name": None,
        "opacity": 1,
        "source_params": "{\"ptype\": \"gxp_olsource\"}",
        "stack_order": 0,
        "transparent": False,
        "visibility": True
    },
    {
        "fixed": True,
        "group": "background",
        "layer_params": "{\"args\": [\"geonode:CA\", \"http://localhost:8080/geoserver/wms\", {\"layers\": \
        [\"geonode:CA\"], \"tiled\": true, \"tilesOrigin\": [-20037508.34, -20037508.34], \"format\":\
        \"image/png\"}, {\"buffer\": 0}], \"type\": \"OpenLayers.Layer.WMS\"}",
        "map": 'GeoNode Default Map',
        "name": None,
        "opacity": 1,
        "source_params": "{\"ptype\": \"gxp_olsource\"}",
        "stack_order": 1,
        "transparent": False,
        "visibility": False
    },
    {
        "fixed": True,
        "group": "background",
        "layer_params": "{}",
        "map": 'GeoNode Default Map',
        "name": "SATELLITE",
        "opacity": 1,
        "source_params": "{\"apiKey\":\
        \"ABQIAAAAkofooZxTfcCv9Wi3zzGTVxTnme5EwnLVtEDGnh-lFVzRJhbdQhQgAhB1eT_2muZtc0dl-ZSWrtzmrw\", \"ptype\":\
        \"gxp_googlesource\"}",
        "stack_order": 2,
        "transparent": False,
        "visibility": False
    },
    {
        "fixed": True,
        "group": "background",
        "layer_params": "{\"args\": [\"No background\"], \"type\": \"OpenLayers.Layer\"}",
        "map": 'GeoNode Default Map',
        "name": None,
        "opacity": 1,
        "source_params": "{\"ptype\": \"gxp_olsource\"}",
        "stack_order": 3,
        "transparent": False,
        "visibility": False
    }
]


def create_test_map():
    if not Map.objects.filter(title='GeoNode Default Map').exists():
        if not TopicCategory.objects.filter(identifier='biota').exists():
            TopicCategory.objects.create(identifier='biota')

        signals.pre_save.disconnect(geoserver_pre_save_maplayer, sender=MapLayer)
        signals.post_save.disconnect(geoserver_post_save_map, sender=Map)
        signals.pre_save.disconnect(geoserver_pre_save, sender=Layer)
        signals.post_save.disconnect(geoserver_post_save, sender=Layer)

        world_extent = [-180, 180, -90, 90]
        biota = TopicCategory.objects.get(identifier='biota')

        map_data = [('GeoNode Default Map', 'GeoNode default map abstract', ('populartag',), world_extent, biota)]
        test_user = get_test_user()

        for md in map_data:
            title, abstract, kws, (bbox_x0, bbox_x1, bbox_y0, bbox_y1), category = md
            m = Map(title=title,
                    abstract=abstract,
                    zoom=4,
                    projection='EPSG:4326',
                    center_x=42,
                    center_y=-73,
                    owner=test_user,
                    bbox_x0=bbox_x0,
                    bbox_x1=bbox_x1,
                    bbox_y0=bbox_y0,
                    bbox_y1=bbox_y1,
                    category=category,
                    )
            m.save()


def create_test_layers_no_disconnect():
    create_test_map()
    # Register only for actionstreams
    for test_layer in map_layers:
        MapLayer.objects.create(
            fixed=test_layer['fixed'],
            group=test_layer['group'],
            name=test_layer['name'],
            layer_params=test_layer['layer_params'],
            map=Map.objects.filter(title=test_layer['map'])[0],
            source_params=test_layer['source_params'],
            stack_order=test_layer['stack_order'],
            opacity=test_layer['opacity'],
            transparent=test_layer['stack_order'],
            visibility=test_layer['stack_order'],
        )


def create_test_map_layers():
    create_test_map()
    signals.pre_save.disconnect(
        geoserver_pre_save_maplayer,
        sender=MapLayer
    )
    signals.post_save.disconnect(geoserver_post_save_map, sender=Map)
    # Register only for actionstreams
    for test_layer in map_layers:
        MapLayer.objects.create(
            fixed=test_layer['fixed'],
            group=test_layer['group'],
            name=test_layer['name'],
            layer_params=test_layer['layer_params'],
            map=Map.objects.filter(title=test_layer['map'])[0],
            source_params=test_layer['source_params'],
            stack_order=test_layer['stack_order'],
            opacity=test_layer['opacity'],
            transparent=test_layer['stack_order'],
            visibility=test_layer['stack_order'],
        )


def create_layer(title, abstract, owner):
    """
    Creates a Layer with some default data for testing
    :param title: (string) Layer title
    :param abstract: (string) Layer abstract description
    :param owner: (User) The user that owns the layer
    :return: (Layer) A Layer object
    """
    elevation = TopicCategory.objects.get(identifier='elevation')
    world_extent = [-180, 180, -90, 90]
    _a, _b, _c, typename, (bbox_x0, bbox_x1, bbox_y0, bbox_y1), dt, kws, category = (
        'layer2',
        'abstract2',
        'layer2',
        'geonode:layer2',
        world_extent,
        '19800501',
        ('populartag',),
        elevation
    )

    year, month, day = map(int, (dt[:4], dt[4:6], dt[6:]))
    start = datetime(year, month, day)
    end = start + timedelta(days=365)
    layer = Layer(
        title=title,
        abstract=abstract,
        name=title,
        typename=typename,
        bbox_x0=bbox_x0,
        bbox_x1=bbox_x1,
        bbox_y0=bbox_y0,
        bbox_y1=bbox_y1,
        uuid=str(uuid4()),
        owner=owner,
        temporal_extent_start=start,
        temporal_extent_end=end,
        date=start,
        storeType='dataStore',
        category=category,
          )
    layer.save()
    return layer
