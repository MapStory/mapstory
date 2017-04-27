from django.db.models import signals

from geonode.base.models import TopicCategory
from geonode.geoserver.signals import geoserver_pre_save_maplayer
from geonode.geoserver.signals import geoserver_post_save_map, geoserver_pre_save, geoserver_post_save

from geonode.maps.models import Map, MapStory, MapLayer, Layer

from mapstory.tests.utils import get_test_user

map_layers = [{"fixed": False,
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
             {"fixed": True,
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
              "visibility": True},
             {"fixed": True,
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
              "visibility": False},
             {"fixed": True,
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
              "visibility": False},
             {"fixed": True,
              "group": "background",
              "layer_params": "{\"args\": [\"No background\"], \"type\": \"OpenLayers.Layer\"}",
              "map": 'GeoNode Default Map',
              "name": None,
              "opacity": 1,
              "source_params": "{\"ptype\": \"gxp_olsource\"}",
              "stack_order": 3,
              "transparent": False,
              "visibility": False}
         ]

def create_test_map():
    if not Map.objects.filter(title='GeoNode Default Map').exists():
        if not TopicCategory.objects.filter(identifier='biota').exists():
            TopicCategory.objects.create(identifier='biota')

        biota = TopicCategory.objects.get(identifier='biota')

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



def create_test_layers():
    create_test_map()
    signals.pre_save.disconnect(
        geoserver_pre_save_maplayer,
        sender=MapLayer
    )
    signals.post_save.disconnect(geoserver_post_save_map, sender=Map)

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

