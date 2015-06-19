(function() {
    'use strict';

    var module = angular.module('storytools.core.mapstory', [
    ]);

    // @todo naive implementation on local storage for now
    module.service('stMapConfigStore', function() {
        function path(mapid) {
            return '/maps/' + mapid;
        }
        function get(mapid) {
            var saved = localStorage.getItem(path(mapid));
            saved = (saved === null) ? {} : angular.fromJson(saved);
            return saved;
        }
        function set(mapConfig) {
            localStorage.setItem(path(mapConfig.id), angular.toJson(mapConfig));
        }
        function list() {
            var maps = [];
            var pattern = new RegExp('/maps/(\\d+)$');
            Object.getOwnPropertyNames(localStorage).forEach(function(key) {
                var match = pattern.exec(key);
                if (match) {
                    // name/title eventually
                    maps.push({
                        id: match[1]
                    });
                }
            });
            return maps;
        }
        function nextId() {
            var lastId = 0;
            var existing = list().map(function(m) {
                return m.id;
            });
            existing.sort();
            if (existing.length) {
                lastId = parseInt(existing[existing.length - 1]);
            }
            return lastId + 1;
        }
        return {
            listMaps: function() {
                return list();
            },
            loadConfig: function(mapid) {
                return get(mapid);
            },
            saveConfig: function(mapConfig) {
                if (!angular.isDefined(mapConfig.id)) {
                    mapConfig.id = nextId();
                }
                set(mapConfig);
            }
        };
    });

})();

(function() {
    'use strict';

    var module = angular.module('storytools.core.ogc', [
    ]);

    // @todo - provisional default story pins style
    var defaultStyle = [new ol.style.Style({
        fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1}),
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
            stroke: new ol.style.Stroke({color: 'red', width: 1})
        })
    })];

    function StoryMap(data) {
      ol.Object.call(this, data);
      this.map_ = new ol.Map({target: data.target});
      this.overlay = new ol.FeatureOverlay({
        map: this.map_,
        style: defaultStyle
      });
      this.storyLayers_ = new ol.Collection();
      this.animationDuration_ = data.animationDuration || 500;
      this.storyPinsLayer = new StoryLayer({
        timeAttribute: 'start_time',
        endTimeAttribute: 'end_time',
        layer: new ol.layer.Vector({
          source: new ol.source.Vector(),
          style: defaultStyle
        })
      });
      this.map_.addLayer(this.storyPinsLayer.getLayer());
    }

    StoryMap.prototype = Object.create(ol.Object.prototype);
    StoryMap.prototype.constructor = StoryMap;

    StoryMap.prototype.setBaseLayer = function(baseLayer) {
      this.set('baselayer', baseLayer);
      this.map_.getLayers().forEach(function(lyr) {
        if (lyr.get('group') === 'background') {
          this.map_.removeLayer(lyr);
        }
      }, this);
      this.map_.getLayers().insertAt(0, this.get('baselayer'));
    };

    StoryMap.prototype.addStoryLayer = function(storyLayer) {
      this.storyLayers_.push(storyLayer);
      // keep pins layer on top
      var idx = this.map_.getLayers().getLength(), me = this;
      this.map_.getLayers().forEach(function(sl) {
        if (sl === me.storyPinsLayer) {
            idx -= 1;
        }
      });
      this.map_.getLayers().insertAt(
        idx,
        storyLayer.getLayer()
      );
    };

    StoryMap.prototype.getStoryLayers = function() {
      return this.storyLayers_;
    };

    StoryMap.prototype.getMap = function() {
      return this.map_;
    };

    StoryMap.prototype.clear = function() {
      this.map_.getLayers().clear();
      this.storyLayers_.clear();
    };

    StoryMap.prototype.animateCenterAndZoom = function(center, zoom) {
      var view = this.map_.getView();
      this.map_.beforeRender(ol.animation.pan({
        duration: this.animationDuration_,
        source: view.getCenter()
      }));
      view.setCenter(center);
      this.map_.beforeRender(ol.animation.zoom({
        resolution: view.getResolution(),
        duration: this.animationDuration_
      }));
      view.setZoom(zoom);
    };

    StoryMap.prototype.setAllowPan = function(allowPan) {
      this.map_.getInteractions().forEach(function(i) {
        if (i instanceof ol.interaction.KeyboardPan ||
          i instanceof ol.interaction.DragPan) {
            i.setActive(allowPan);
        }
      });
    };

    StoryMap.prototype.setAllowZoom = function(allowZoom) {
      var zoomCtrl;
      this.map_.getControls().forEach(function(c) {
        if (c instanceof ol.control.Zoom) {
          zoomCtrl = c;
        }
      });
      if (!allowZoom) {
        this.map_.removeControl(zoomCtrl);
      } else {
        this.map_.addControl(new ol.control.Zoom());
      }
      this.map_.getInteractions().forEach(function(i) {
        if (i instanceof ol.interaction.DoubleClickZoom ||
          i instanceof ol.interaction.PinchZoom ||
          i instanceof ol.interaction.DragZoom ||
          i instanceof ol.interaction.MouseWheelZoom) {
            i.setActive(allowZoom);
        }
      });
    };

    module.constant('StoryMap', StoryMap);

    function EditableStoryMap(data) {
      StoryMap.call(this, data);
    }

    EditableStoryMap.prototype = Object.create(StoryMap.prototype);
    EditableStoryMap.prototype.constructor = EditableStoryMap;

    module.constant('EditableStoryMap', EditableStoryMap);

    EditableStoryMap.prototype.getState = function() {
      var config = {};
      config.map = {
        center: this.map_.getView().getCenter(),
        projection: this.map_.getView().getProjection().getCode(),
        zoom: this.map_.getView().getZoom(),
        layers: []
      };
      var mapId = this.get('id');
      if (mapId >= 0) {
        config.id = mapId;
      }
      var baseLayer = this.get('baselayer');
      if (baseLayer) {
        var baseLayerState = this.get('baselayer').get('state');
        baseLayerState.group = 'background';
        baseLayerState.visibility = true;
        config.map.layers.push(baseLayerState);
      }
      this.storyLayers_.forEach(function(storyLayer) {
        config.map.layers.push(storyLayer.getState());
      });
      return config;
    };

    EditableStoryMap.prototype.removeStoryLayer = function(storyLayer) {
      this.storyLayers_.remove(storyLayer);
      this.map_.removeLayer(storyLayer.getLayer());
    };

    function StoryLayer(data) {
      if (data.times && storytools.core.time.utils.isRangeLike(data.times)) {
        data.times = new storytools.core.time.utils.Interval(data.times);
      }
      ol.Object.call(this, data);
      var layer;
      if (this.get('type') === 'VECTOR') {
        layer = new ol.layer.Vector();
      } else if (this.get('type') === 'WMS') {
        var config = {
          useOldAsInterimTiles: true
        };
        if (this.get('singleTile') === true) {
          layer = new ol.layer.Image(config);
        } else {
          layer = new ol.layer.Tile(config);
        }
      } else {
          layer = data.layer;
      }
      this.layer_ = layer;
    }

    StoryLayer.prototype = Object.create(ol.Object.prototype);
    StoryLayer.prototype.constructor = StoryLayer;

    StoryLayer.prototype.setWMSSource = function() {
      var layer = this.getLayer();
      var name = this.get('name');
      var times = this.get('times');
      var singleTile = this.get('singleTile');
      var params = {
        'LAYERS': name,
        'VERSION': '1.1.0',
        'TILED': true
      };
      if (times) {
        params.TIME = new Date(times.start || times[0]).toISOString();
      }
      if (singleTile) {
        layer.setSource(new ol.source.ImageWMS({
          params: params,
          url: this.get('url'),
          serverType: 'geoserver'
        }));
      } else {
        var tileGrid, resolutions = this.get('resolutions'),
          bbox = this.get('bbox');
        if (resolutions && bbox) {
          tileGrid = new ol.tilegrid.TileGrid({
            extent: bbox,
            resolutions: resolutions
          });
        }
        // @todo use urls for subdomain loading
        layer.setSource(new ol.source.TileWMS({
          url: this.get('url'),
          params: params,
          tileGrid: tileGrid,
          serverType: 'geoserver'
        }));
      }
    };

    StoryLayer.prototype.getState = function() {
      var state = this.getProperties();
      delete state.features;
      return state;
    };

    StoryLayer.prototype.getLayer = function() {
      return this.layer_;
    };

    StoryLayer.prototype.setLayer = function(layer) {
      this.layer_ = layer;
    };

    module.constant('StoryLayer', StoryLayer);

    function EditableStoryLayer(data) {
      StoryLayer.call(this, data);
    }

    EditableStoryLayer.prototype = Object.create(StoryLayer.prototype);
    EditableStoryLayer.prototype.constructor = EditableStoryLayer;

    module.constant('EditableStoryLayer', EditableStoryLayer);

    module.service('stAnnotateLayer', ["$http", "$q", function($http, $q) {
      return {
        loadCapabilities: function(storyLayer) {
          var request = 'GetCapabilities', service = 'WMS';
          return $http({
            method: 'GET',
            url: storyLayer.get('url'),
            params: {
              'REQUEST': request,
              'SERVICE': service,
              'VERSION': '1.3.0'
            }
          }).success(function(data) {
            var caps = new ol.format.WMSCapabilities().read(data);
            storyLayer.set('latlonBBOX',
                caps.Capability.Layer.Layer[0].EX_GeographicBoundingBox);
            var found = storytools.core.time.maps.readCapabilitiesTimeDimensions(caps);
            var name = storyLayer.get('name');
            if (name in found) {
              storyLayer.set('times', found[name]);
            }
          });
        },
        describeFeatureType: function(storyLayer) {
          var me = this;
          var request = 'DescribeFeatureType', service = 'WFS';
          var id = storyLayer.get('id');
          return $http({
            method: 'GET',
            url: storyLayer.get('url'),
            params: {
              'SERVICE': service,
              'VERSION': '1.0.0',
              'REQUEST': request,
              'TYPENAME': id
            }
          }).success(function(data) {
            var parser = new storytools.edit.WFSDescribeFeatureType.WFSDescribeFeatureType();
            var layerInfo = parser.parseResult(data);
            if (layerInfo.timeAttribute) {
              storyLayer.set('timeAttribute', layerInfo.timeAttribute);
            } else if (storyLayer.get('timeEndpoint')) {
              me.getTimeAttribute(storyLayer);
            }
            var parts = id.split(':');
            storyLayer.set('typeName', id);
            storyLayer.set('featurePrefix', parts[0]);
            storyLayer.set('featureNS', layerInfo.featureNS);
            storyLayer.set('geomType', layerInfo.geomType);
            storyLayer.set('attributes', layerInfo.attributes);
          });
        },
        getTimeAttribute: function(storyLayer) {
          var me = this;
          return $http({
            method: 'GET',
            url: storyLayer.get('timeEndpoint')
          }).success(function(data) {
            storyLayer.set('timeAttribute', data.attribute);
            if (data.endAttribute) {
              storyLayer.set('endTimeAttribute', data.endAttribute);
            }
          });
        },
        getStyleName: function(storyLayer) {
          if (storyLayer.get('canStyleWMS')) {
            var me = this;
            return $http({
              method: 'GET',
              url: storyLayer.get('path') + 'rest/layers/' + storyLayer.get('id') + '.json'
            }).success(function(response) {
              storyLayer.set('styleName', response.layer.defaultStyle.name);
            });
          } else {
            return $q.when('');
          }
        },
        getFeatures: function(storyLayer, map) {
            var name = storyLayer.get('id');
            var wfsUrl = storyLayer.get('url') + '?service=WFS&version=1.1.0&request=GetFeature&typename=' +
                name + '&outputFormat=application/json' +
                '&srsName=' + map.getView().getProjection().getCode();
            return $http({
              method: 'GET',
              url: wfsUrl
            }).success(function(response) {
              var layer = storyLayer.getLayer();
              var features = new ol.format.GeoJSON().readFeatures(response);
              layer.setSource(new ol.source.Vector());
              storyLayer.set('features', features);
            });
        }
      };
    }]);

    module.service('stBaseLayerBuilder', function() {
      return {
        buildLayer: function(data) {
          if (data.type === 'MapQuest') {
            return new ol.layer.Tile({
              state: data,
              title: data.title,
              group: 'background',
              source: new ol.source.MapQuest({layer: data.layer})
            });
          } else if (data.type === 'HOT') {
            return new ol.layer.Tile({
              state: data,
              title: data.title,
              group: 'background',
              source: new ol.source.OSM({
                attributions: [
                  new ol.Attribution({
                    html: 'Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                  }),
                  ol.source.OSM.ATTRIBUTION
                ],
                crossOrigin: null,
                url: 'http://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
              })
            });
          } else if (data.type === 'OSM') {
            return new ol.layer.Tile({
              state: data,
              title: data.title,
              group: 'background',
              source: new ol.source.OSM()
            });
          } else if (data.type === 'MapBox') {
            var layer = new ol.layer.Tile({state: data, title: data.title, group: 'background'});
            var name = data.name;
            var urls = [
              'http://a.tiles.mapbox.com/v1/mapbox.',
              'http://b.tiles.mapbox.com/v1/mapbox.',
              'http://c.tiles.mapbox.com/v1/mapbox.',
              'http://d.tiles.mapbox.com/v1/mapbox.'
            ];
            var tileUrlFunction = function(tileCoord, pixelRatio, projection) {
              var zxy = tileCoord;
              if (zxy[1] < 0 || zxy[2] < 0) {
                return "";
              }
              return urls[Math.round(Math.random()*3)] + name + '/' +
                  zxy[0].toString()+'/'+ zxy[1].toString() +'/'+
                  zxy[2].toString() +'.png';
            };
            layer.setSource(new ol.source.TileImage({
              crossOrigin: null,
              attributions: [
                new ol.Attribution({
                  html: /^world/.test(name) ?
                      "<a href='http://mapbox.com'>MapBox</a> | Some Data &copy; OSM CC-BY-SA | <a href='http://mapbox.com/tos'>Terms of Service</a>" :
                      "<a href='http://mapbox.com'>MapBox</a> | <a href='http://mapbox.com/tos'>Terms of Service</a>"
                })
              ],
              tileGrid: new ol.tilegrid.TileGrid({
                origin: [-128 * 156543.03390625, -128 * 156543.03390625],
                resolutions: [
                    156543.03390625, 78271.516953125, 39135.7584765625,
                    19567.87923828125, 9783.939619140625, 4891.9698095703125,
                    2445.9849047851562, 1222.9924523925781, 611.4962261962891,
                    305.74811309814453, 152.87405654907226, 76.43702827453613,
                    38.218514137268066, 19.109257068634033, 9.554628534317017,
                    4.777314267158508, 2.388657133579254, 1.194328566789627,
                    0.5971642833948135
                ]
              }),
              tileUrlFunction: tileUrlFunction
            }));
            return layer;
          } else if (data.type === 'WMS') {
            return new ol.layer.Tile({
                group: "background",
                source: new ol.source.TileWMS({
                    url: data.url,
                    params: data.params
                })
            });
          } else {
              throw new Error('no type for : ' + JSON.stringify(data));
          }
        }
      };
    });

    module.service('stEditableLayerBuilder', ["$q", "stAnnotateLayer", "stBaseLayerBuilder", function($q, stAnnotateLayer, stBaseLayerBuilder) {
      return {
        buildEditableLayer: function(data, map) {
          var layer = new EditableStoryLayer(data);
          var deferred = $q.defer();
          var promises = [];
          // TODO add this back when we have WMS-C GetCaps
          var needsCaps = !(data.latlonBBOX && data.times/* && data.bbox && data.resolutions*/);
          if (needsCaps) {
            promises.push(stAnnotateLayer.loadCapabilities(layer));
          }
          var needsDFT = !data.attributes;
          if (needsDFT) {
            promises.push(stAnnotateLayer.describeFeatureType(layer));
          }
          if (data.type === 'VECTOR' && !data.features) {
            promises.push(stAnnotateLayer.getFeatures(layer, map));
          } else {
            promises.push(stAnnotateLayer.getStyleName(layer));
          }
          $q.all(
            promises
          ).then(function() {
            // this needs to be done here when everything is resolved
            if (layer.get('features')) {
              var times = layer.get('times');
              if (times) {
                var start = times.start || times[0];
                storytools.core.time.maps.filterVectorLayer(layer, {start: start, end: start});
              } else {
                olLayer.getSource().addFeatures(layer.get('features'));
              }
            } else {
              layer.setWMSSource();
            }
            deferred.resolve(layer);
          }, function() {
            deferred.reject(arguments);
          });
          return deferred.promise;
        }
      };
    }]);

    module.service('stLayerBuilder', ["$q", function($q) {
      return {
        buildLayer: function(data, map) {
          var layer = new StoryLayer(data);
          var deferred = $q.defer();
          layer.setWMSSource();
          deferred.resolve(layer);
          return deferred.promise;
        }
      };
    }]);

    module.service('stStoryMapBaseBuilder', ["stBaseLayerBuilder", function(stBaseLayerBuilder) {
      return {
        defaultMap: function(storymap) {
          storymap.getMap().setView(new ol.View({center: [0,0], zoom: 3}));
          this.setBaseLayer(storymap, {
            title: 'Satellite Imagery',
            type: 'MapQuest',
            layer: 'sat'
          });
        },
        setBaseLayer: function(storymap, data) {
          var baseLayer = stBaseLayerBuilder.buildLayer(data);
          storymap.setBaseLayer(baseLayer);
        }
      };
    }]);

    module.service('stStoryMapBuilder', ["stLayerBuilder", "stStoryMapBaseBuilder", function(stLayerBuilder, stStoryMapBaseBuilder) {
      return {
        modifyStoryMap: function(storymap, data) {
          storymap.clear();
          var mapConfig = (data.tools !== undefined) ? storytools.mapstory.MapConfigTransformer.MapConfigTransformer(data): data;
          if (mapConfig.id >= 0) {
            storymap.set('id', mapConfig.id);
          }
          for (var i = 0, ii = mapConfig.map.layers.length; i < ii; ++i) {
            var layerConfig = mapConfig.map.layers[i];
            if (layerConfig.group === 'background' && layerConfig.visibility === true) {
              stStoryMapBaseBuilder.setBaseLayer(storymap, layerConfig);
            } else {
              /*jshint loopfunc: true */
              stLayerBuilder.buildLayer(layerConfig, storymap.getMap()).then(function(sl) {
                // TODO insert at the correct index
                storymap.addStoryLayer(sl);
              });
            }
          }
          storymap.getMap().setView(new ol.View({
            center: mapConfig.map.center,
            zoom: mapConfig.map.zoom,
            projection: mapConfig.map.projection
          }));
        }
      };
    }]);

    module.service('stEditableStoryMapBuilder', ["stStoryMapBaseBuilder", "stEditableLayerBuilder", function(stStoryMapBaseBuilder, stEditableLayerBuilder) {
      return {
        modifyStoryLayer: function(storymap, storylayer) {
          var data = storylayer.getProperties();
          if (data.type === 'WMS') {
            data.type = 'VECTOR';
          } else {
            delete data.features;
            data.type = 'WMS';
          }
          stEditableLayerBuilder.buildEditableLayer(data, storymap.getMap()).then(function(sl) {
            storymap.removeStoryLayer(storylayer);
            storymap.addStoryLayer(sl);
          });
        },
        modifyStoryMap: function(storymap, data) {
          storymap.clear();
          var mapConfig = data.tools ? storytools.mapstory.MapConfigTransformer.MapConfigTransformer(data): data;
          if (mapConfig.id >= 0) {
            storymap.set('id', mapConfig.id);
          }
          for (var i = 0, ii = mapConfig.map.layers.length; i < ii; ++i) {
            var layerConfig = mapConfig.map.layers[i];
            if (layerConfig.group === 'background' && layerConfig.visibility === true) {
              stStoryMapBaseBuilder.setBaseLayer(storymap, layerConfig);
            } else {
              /*jshint loopfunc: true */
              stEditableLayerBuilder.buildEditableLayer(layerConfig, storymap.getMap()).then(function(sl) {
                // TODO insert at the correct index
                storymap.addStoryLayer(sl);
              });
            }
          }
          storymap.getMap().setView(new ol.View({
            center: mapConfig.map.center,
            zoom: mapConfig.map.zoom,
            projection: mapConfig.map.projection
          }));
        }
      };
    }]);

})();

(function() {
    'use strict';

    var module = angular.module('storytools.core.pins', [
    ]);

    var pins = storytools.core.maps.pins;

    function StoryPinLayerManager() {
        this.storyPins = [];
    }
    StoryPinLayerManager.prototype.pinsChanged = function(pins, action) {
        var i;
        if (action == 'delete') {
            for (i = 0; i < pins.length; i++) {
                var pin = pins[i];
                for (var j = 0, jj = this.storyPins.length; j < jj; j++) {
                    if (this.storyPins[j].id == pin.id) {
                        this.storyPins.splice(j, 1);
                        break;
                    }
                }
            }
        } else if (action == 'add') {
            for (i = 0; i < pins.length; i++) {
                this.storyPins.push(pins[i]);
            }
        } else if (action == 'change') {
            // provided edits could be used to optimize below
        } else {
            throw new Error('action? :' + action);
        }
        // @todo optimize by looking at changes
        var times = this.storyPins.map(function(p) {
            if (p.start_time > p.end_time) {
                return storytools.core.utils.createRange(p.end_time, p.start_time);
            } else {
                return storytools.core.utils.createRange(p.start_time, p.end_time);
            }
        });
        this.storyPinsLayer.set('times', times);
        this.storyPinsLayer.set('features', this.storyPins);
    };
    StoryPinLayerManager.prototype.loadFromGeoJSON = function(geojson, projection) {
        var loaded = pins.loadFromGeoJSON(geojson, projection);
        this.pinsChanged(loaded, 'add', true);
    };

    module.service('StoryPinLayerManager', StoryPinLayerManager);

    module.constant('StoryPin', pins.StoryPin);

    // @todo naive implementation on local storage for now
    module.service('stAnnotationsStore', ["StoryPin", function(StoryPin) {
        function path(mapid) {
            return '/maps/' + mapid + '/annotations';
        }
        function get(mapid) {
            var saved = localStorage.getItem(path(mapid));
            saved = (saved === null) ? [] : JSON.parse(saved);
            saved.forEach(function(s) {
                s.the_geom = format.readGeometry(s.the_geom);
            });
            return saved;
        }
        function set(mapid, annotations) {
            annotations.forEach(function(s) {
                if (s.the_geom && !angular.isString(s.the_geom)) {
                    s.the_geom = format.writeGeometry(s.the_geom);
                }
            });
            localStorage.setItem(path(mapid), angular.toJson(annotations));
        }
        return {
            loadAnnotations: function(mapid, projection) {
                return StoryPin.createStoryPins(get(mapid), projection);
            },
            deleteAnnotations: function(annotations) {
                var saved = get();
                var toDelete = annotations.map(function(d) {
                    return d.id;
                });
                saved = saved.filter(function(s) {
                    return toDelete.indexOf(s.id) < 0;
                });
                set(saved);
            },
            saveAnnotations: function(mapid, annotations) {
                var saved = get();
                var maxId = 0;
                saved.forEach(function(s) {
                    maxId = Math.max(maxId, s.id);
                });
                annotations.forEach(function(a) {
                    if (typeof a.id == 'undefined') {
                        a.id = ++maxId;
                    }
                });
                set(mapid, annotations);
            }
        };
    }]);

})();

(function() {
    'use strict';

    angular.module('storytools.core.style', [
        'storytools.core.style.ol3StyleConverter',
        'storytools.core.style.svgIcon'
    ]);

})();
(function() {
    'use strict';

    var module = angular.module('storytools.core.style.ol3StyleConverter', []);

    module.factory('ol3MarkRenderer', ["ol3StyleConverter", function(ol3StyleConverter) {
        return function(shapeName, size) {
            var black = ol3StyleConverter.getColor('#000000');
            var strokeWidth = 3; // hack to fix down-scaling for x and cross
            var opts = {color: black, width: strokeWidth};
            var canvas = angular.element(ol3StyleConverter.generateShape({
                    symbol: {shape: shapeName, size: size - strokeWidth}
                },
                new ol.style.Fill(opts),
                new ol.style.Stroke(opts)).getImage());
            return canvas;
        };
    }]);

    module.factory('ol3StyleConverter', ["stSvgIcon", function(stSvgIcon) {
        return {
            generateShapeConfig: function(style, fill, stroke) {
                var shape = style.symbol.shape,
                    // final size is actually (2 * (radius + stroke.width)) + 1
                    radius = style.symbol.size / 2;
                if (shape === 'circle') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        radius: radius
                    };
                } else if (shape === 'square') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        angle: Math.PI / 4
                    };
                } else if (shape === 'triangle') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 3,
                        radius: radius,
                        angle: 0
                    };
                } else if (shape === 'star') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 5,
                        radius: radius,
                        radius2: 0.5*radius,
                        angle: 0
                    };
                } else if (shape === 'cross') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        radius2: 0,
                        angle: 0
                    };
                } else if (shape === 'x') {
                    return {
                        fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: radius,
                        radius2: 0,
                        angle: Math.PI / 4
                    };
                }
            },
            calculateRotation: function(style, feature) {
                if (style.symbol && style.symbol.rotationAttribute) {
                    if (style.symbol.rotationUnits === 'radians') {
                        return feature.get(style.symbol.rotationAttribute);
                    } else {
                        return (feature.get(style.symbol.rotationAttribute)/360)*Math.PI;
                    }
                } else {
                    return undefined;
                }
            },
            generateShape: function(style, fill, stroke, feature) {
                var config = this.generateShapeConfig(style, fill, stroke);
                if (config && feature) {
                    config.rotation = this.calculateRotation(style, feature);
                }
                if (style.symbol.graphic) {
                    var info = stSvgIcon.getImage(style.symbol.graphic, fill.getColor(), stroke.getColor(), true);
                    return new ol.style.Icon({
                        src: info.dataURI,
                        rotation: this.calculateRotation(style, feature),
                        scale: style.symbol.size / Math.max(info.width, info.height),
                        opacity: style.symbol.opacity
                    });
                } else if (style.symbol.shape === 'circle') {
                    return new ol.style.Circle(config);
                } else {
                    return new ol.style.RegularShape(config);
                }
            },
            getText: function(style, feature) {
                if (style.label && style.label.attribute) {
                    return '' + feature.get(style.label.attribute);
                } else {
                    return undefined;
                }
            },
            generateText: function(style, stroke, feature) {
                if (style.label && style.label.attribute !== null) {
                    return new ol.style.Text({
                        fill: new ol.style.Fill({color: style.label.fillColor}),
                        stroke: stroke,
                        font: style.label.fontStyle + ' ' + style.label.fontWeight + ' ' + style.label.fontSize + 'px ' + style.label.fontFamily,
                        text: this.getText(style, feature)
                    });
                }
            },
            getColor: function(color, opacity) {
                var rgba = ol.color.asArray(color);
                if (opacity !== undefined) {
                    rgba = rgba.slice();
                    rgba[3] = opacity/100;
                }
                return 'rgba(' + rgba.join(',') + ')';
            },
            generateCacheKey: function(style, feature) {
                var text = this.getText(style, feature);
                var classify = (style.classify && style.classify.attribute) ? feature.get(style.classify.attribute) : undefined;
                var rotation = (style.symbol && style.symbol.rotationAttribute) ? feature.get(style.symbol.rotationAttribute): undefined;
                return text + '|' + classify + '|' + rotation;
            },
            generateStyle: function(style, feature, resolution) {
                var result, key2;
                if (!this.styleCache_) {
                    this.styleCache_ = {};
                }
                var key = JSON.stringify(style);
                if (this.styleCache_[key]) {
                    if (!this.styleCache_[key].length) {
                        key2 = this.generateCacheKey(style, feature);
                        if (this.styleCache_[key][key2]) {
                            return this.styleCache_[key][key2];
                        }
                    } else {
                        return this.styleCache_[key];
                    }
                }
                var stroke;
                if (style.stroke) {
                    var lineDash;
                    if (style.stroke.strokeStyle === 'dashed') {
                        lineDash = [5];
                    } else if (style.stroke.strokeStyle === 'dotted') {
                        lineDash = [1,2];
                    }
                    stroke = new ol.style.Stroke({
                        lineDash: lineDash,
                        color: this.getColor(style.stroke.strokeColor, style.stroke.strokeOpacity),
                        width: style.stroke.strokeWidth
                    });
                }
                if (style.classify && style.classify.attribute !== null) {
                    var label;
                    for (var i=0, ii=style.rules.length; i<ii; ++i) {
                        var rule = style.rules[i];
                        var attrVal = feature.get(style.classify.attribute);
                        var match = false;
                        if (rule.value !== undefined) {
                            match = attrVal === rule.value;
                        } else if (rule.range) {
                            match = (attrVal >= rule.range.min && attrVal <= rule.range.max);
                        }
                        if (match) {
                            label = this.generateText(style, stroke, feature);
                            if (style.geomType === 'point' && rule.style.symbol.fillColor) {
                                result = [new ol.style.Style({
                                    text: label,
                                    image: this.generateShape(style, new ol.style.Fill({color: rule.style.symbol.fillColor}), stroke, feature)
                                })];
                            } else if (style.geomType === 'line' && rule.style.stroke.strokeColor) {
                                result = [new ol.style.Style({
                                    text: label,
                                    stroke: new ol.style.Stroke({
                                        color: rule.style.stroke.strokeColor,
                                        width: 2
                                    })
                                })];
                            } else if (style.geomType === 'polygon' && rule.style.symbol.fillColor) {
                                result = [new ol.style.Style({
                                    text: label,
                                    stroke: stroke,
                                    fill: new ol.style.Fill({
                                        color: rule.style.symbol.fillColor
                                    })
                                })];
                            }
                        }
                    }
                    if (result) {
                        if (!this.styleCache_[key]) {
                            this.styleCache_[key] = {};
                        }
                        key2 = this.generateCacheKey(style, feature);
                        this.styleCache_[key][key2] = result;
                    }
                } else {
                    var fill = new ol.style.Fill({
                        color: this.getColor(style.symbol.fillColor, style.symbol.fillOpacity)
                    });
                    result = [
                        new ol.style.Style({
                            image: this.generateShape(style, fill, stroke, feature),
                            fill: fill,
                            stroke: stroke,
                            text: this.generateText(style, stroke, feature)
                        })
                    ];
                }
                if (result) {
                    var hasText = result[0].getText();
                    if (hasText || (style.classify && style.classify.attribute) || (style.symbol && style.symbol.rotationAttribute)) {
                        if (!this.styleCache_[key]) {
                            this.styleCache_[key] = {};
                        }
                        key2= this.generateCacheKey(style, feature);
                        this.styleCache_[key][key2] = result;
                    } else {
                        this.styleCache_[key] = result;
                    }
                }
                return result;
            }
        };
    }]);
})();

(function() {
    'use strict';

    var module = angular.module('storytools.core.style.svgIcon', []);

    module.factory('stSvgIcon', ["$cacheFactory", "$http", "$q", "$log", function($cacheFactory, $http, $q, $log) {
        var element = angular.element(document.createElement('div'));
        var imageCache = $cacheFactory('stSvgImage');
        var dataCache = $cacheFactory('stSvgData');
        function process(svg, fill, stroke) {
            element.html(svg);
            // @todo make smarter
            ['path', 'polygon', 'circle', 'ellipse', 'rect', 'line', 'polyline'].forEach(function(el) {
                angular.forEach(element.find(el), function(e) {
                    // @todo does it make sense to override stroke width?
                    e = angular.element(e);
                    var css = {
                        opacity: 1
                    };
                    var existingFill = e.css('fill') || e.attr('fill') || '';
                    if (existingFill != 'none' && existingFill != 'rgb(255, 255, 255)' && existingFill.toLowerCase() != '#ffffff') {
                        css.fill = fill;
                    }
                    var existingStroke = e.css('stroke') || e.attr('stroke');
                    if (existingStroke != 'none') {
                        css.stroke = stroke;
                    }
                    e.css(css);
                });
            });
            var root = element.find('svg');
            var width = parseInt(root.attr('width'));
            var height = parseInt(root.attr('height'));
            // ugh - we're totally guessing here but things go badly without:
            // on firefox: ns_error_not_available on calling canvas.drawimage
            // on chrome: very large icon (default size as it renders)
            // we might be able to set the src on an img element and figure this out...
            if (isNaN(width) || isNaN(height)) {
                root.attr('width', 64);
                root.attr('height', 64);
                width = 64;
                height = 64;
            }
            var dataURI = 'data:image/svg+xml;base64,' + btoa(element.html());
            return {
                dataURI: dataURI,
                width: width,
                height: height
            };
        }
        return {
            getImage: function(svgURI, fill, stroke, sync) {
                var key = svgURI + fill + stroke;
                var cached = imageCache.get(key);
                var deferred = $q.defer();
                if (cached) {
                    if (sync) {
                        return cached;
                    }
                    deferred.resolve(cached);
                } else {
                    if (sync) {
                        var svg = dataCache.get(svgURI);
                        if (svg) {
                            var imageInfo = process(svg, fill, stroke);
                            imageInfo.uri = svgURI;
                            imageCache.put(key, imageInfo);
                            return imageInfo;
                        }
                        $log.warning('no svg for', svgURI);
                        return null;
                    }
                    this.getImageData(svgURI).then(function(response) {
                        var imageInfo = process(response.data, fill, stroke);
                        imageInfo.uri = svgURI;
                        imageCache.put(key, imageInfo);
                        deferred.resolve(imageInfo);
                    }, function() {
                        deferred.reject('error');
                    });
                }
                return deferred.promise;
            },
            getImageData: function(svgURI) {
                return $http.get(svgURI, {cache: true}).success(function(response) {
                    dataCache.put(svgURI, response);
                    return response;
                }).error(function() {
                    $log.warn('error fetching ' + svgURI);
                });
            }
        };
    }]);

})();

(function() {
    'use strict';

    /**
     * @namespace storytools.core.time.directives
     */
    var module = angular.module('storytools.core.time.directives', []);

    /**
     * @ngdoc directive
     * @name stPlaybackControls
     * @memberOf storytools.core.time.directives
     * @description
     * Directive that presents playback controls to manipulate the provided
     * TimeController instance.
     *
     * @param {TimeController} time-controls attribute
     */
    module.directive('stPlaybackControls', function() {
        return {
            restrict: 'E',
            templateUrl: 'time/playback-controls.html',
            scope: {
                timeControls: '='
            },
            link: function (scope, elem) {
                scope.playText = "Start";
                scope.loopText = "Enable Loop";
                scope.loop = false;
                scope.next = function () {
                    scope.timeControls.next();
                };
                scope.prev = function () {
                    scope.timeControls.prev();
                };
                scope.$watch('timeControls', function (neu, old) {
                    if (neu !== old) {
                        neu.on('stateChange', function () {
                            var started = scope.timeControls.isStarted();
                            scope.started = started;
                            scope.playText = started ? "Stop" : "Start";
                            scope.$apply();
                        });
                        neu.on('rangeChange', function (range) {
                            scope.currentRange = range;
                            scope.$apply();
                        });
                    }
                });
                scope.play = function () {
                    var tc = scope.timeControls;
                    var started = tc.isStarted();
                    if (started) {
                        tc.stop();
                    } else {
                        tc.start();
                    }
                };
                scope.toggleLoop = function () {
                    var tc = scope.timeControls;
                    scope.loop = tc.loop = !tc.loop;
                    scope.loopText = tc.loop ? 'Disable Loop' : 'Enable Loop';
                };
            }
        };
    });

    /**
     * @ngdoc directive
     * @name stPlaybackSettings
     * @memberOf storytools.core.time.directives
     * @description
     * Directive that presents playback settings that manipulate the provided
     * TimeController instance.
     *
     * @param {TimeController} time-controls attribute
     * @param {object} playbackOptions (will go away)
     */
    module.directive('stPlaybackSettings', function () {
        return {
            restrict: 'E',
            templateUrl: 'time/playback-settings.html',
            scope: {
                timeControls: '=',
                // @todo remove once timeControls properly exposes access to this
                playbackOptions: '='
            },
            link: function (scope, elem) {
                scope.optionsChanged = function () {
                    if (scope.timeControls) {
                        scope.timeControls.update(scope.playbackOptions);
                    }
                };
            }
        };
    });
})();
(function() {
    'use strict';

    var module = angular.module('storytools.core.time', [
        'storytools.core.time.directives',
        'storytools.core.time.services',
        'storytools.core.templates'
    ]);

    module.filter('isodate', function() {
        // @todo should support optional precision specifier (as unit?)
        return function(input) {
            return input !== null && angular.isDefined(input)  ?
                angular.isNumber(input) ? new Date(input).toISOString():
                    Date.parse(input).toISOString():
                    '';
        };
    });

})();
(function() {
    'use strict';

    var module = angular.module('storytools.core.time.services', []);

    var stutils = storytools.core.time.utils;

    /**
     * Compute a sorted, unique array of ticks for the provided layers. The
     * algorithm uses any provided instant or extent(start value used) list values
     * and looks at the total range of all interval values creating a tick at the
     * minimum interval for the total range. See the tests for examples.
     * @param {array|ol.Map} layersWithTime
     * @returns array of ticks
     */
    function computeTicks(layersWithTime) {
        // allow a map to be passed in
        if (!angular.isArray(layersWithTime)) {
            var storyMap = layersWithTime;
            layersWithTime = storyMap.getStoryLayers().getArray().filter(function(l) {
                var times = l.get('times');
                /*jshint eqnull:true */
                return times != null;
            });
            layersWithTime.push(storyMap.storyPinsLayer);
        }
        var ticks = {};
        var totalRange = null;
        var intervals = [];
        function addTick(add) {
            add = stutils.getTime(add);
            if (add !== null && ! (add in ticks)) {
                ticks[add] = 1;
            }
        }
        layersWithTime.forEach(function(l) {
            var times = l.get('times');
            var range;
            if (angular.isArray(times)) {
                // an array of instants or extents
                range = stutils.computeRange(times);
                if (times.length) {
                    if (stutils.isRangeLike(times[0])) {
                        times.forEach(function(r) {
                            addTick(r.start);
                            if (totalRange === null) {
                                totalRange = stutils.createRange(r);
                            } else {
                                totalRange.extend(r);
                            }
                        });
                    } else {
                        times.forEach(function(r) {
                            addTick(r);
                        });
                    }
                }
                // add a tick at the end to ensure we get there
                /*jshint eqnull:true */
                if (range.end != null) {
                    addTick(range.end);
                }
            } else if (times) {
                // a interval (range+duration)
                range = times;
                intervals.push(times);
            }
            if (totalRange === null) {
                // copy, will be modifying
                totalRange = stutils.createRange(range);
            } else {
                totalRange.extend(range);
            }
        });
        if (intervals.length) {
            intervals.sort(function(a, b) {
                return a.interval - b.interval;
            });
            var smallest = intervals[0];
            var start = totalRange.start;
            while (start <= totalRange.end) {
                addTick(start);
                start = smallest.offset(start);
            }
        }
        ticks = Object.getOwnPropertyNames(ticks).map(function(t) {
            return parseInt(t);
        });
        return ticks.sort(function(a, b) {
            return a - b;
        });
    }

    function TimeControlsManager($rootScope, StoryPinLayerManager, MapManager) {
        this.timeControls = null;
        var timeControlsManager = this;

        function maybeCreateTimeControls(update) {
            if (timeControlsManager.timeControls !== null) {
                if (update) {
                    var values = update();
                    if (values) {
                        timeControlsManager.timeControls.update(values);
                    }
                }
                return;
            }
            var range = computeTicks(MapManager.storyMap);
            if (range.length) {
                var annotations = StoryPinLayerManager.storyPins;
                timeControlsManager.timeControls = storytools.core.time.create({
                    annotations: annotations,
                    storyMap: MapManager.storyMap,
                    data: range,
                    mode: MapManager.storyMap.mode,
                    tileStatusCallback: function(remaining) {
                        $rootScope.$broadcast('tilesLoaded', remaining);
                    }
                });
                timeControlsManager.timeControls.on('rangeChange', function(range) {
                    timeControlsManager.currentRange = range;
                });
            }
        }

        MapManager.storyMap.getStoryLayers().on('change:length', function() {
            maybeCreateTimeControls(function() {
                var range = computeTicks(MapManager.storyMap);
                if (range.length) {
                    return {
                        data: range
                    };
                }
            });
        });
        var pinsLayer = MapManager.storyMap.storyPinsLayer;
        pinsLayer.on('change:features', function() {
            maybeCreateTimeControls(function() {
                var range = computeTicks(MapManager.storyMap);
                if (range.length) {
                    return {
                        annotations: pinsLayer.get("features"),
                        data: range
                    };
                }
            });
        });
        maybeCreateTimeControls();
    }

    module.constant('TimeControlsManager', TimeControlsManager);

    module.service('TimeMachine', function() {
        return {
            computeTicks: computeTicks
        };
    });
})();
