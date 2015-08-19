<script type="text/javascript">
'use strict';

(function() {

    var module = angular.module('viewer', [
        'storytools.core.time',
        'storytools.core.mapstory',
        'storytools.core.pins',
        'storytools.core.boxes',
        'storytools.core.ogc',
        'ui.bootstrap'
    ]);

    module.constant('iconCommonsHost', 'http://mapstory.dev.boundlessgeo.com');

    module.run(function() {
        // install a watchers debug loop
        (function() {
            var root = angular.element(document.getElementsByTagName('body'));
            var last;
            var watchers = 0;

            var f = function(element) {
                if (element.data().hasOwnProperty('$scope')) {
                    watchers += (element.data().$scope.$$watchers || []).length;
                }

                angular.forEach(element.children(), function(childElement) {
                    f(angular.element(childElement));
                });
            };

            window.setInterval(function() {
                watchers = 0;
                f(root);
                if (watchers != last) {
                    console.log(watchers);
                }
                last = watchers;
            }, 1000);

        })();
    });

    function MapManager($http, $q, $log, $rootScope, $location,
        StoryPinLayerManager, StoryBoxLayerManager, stMapConfigStore, StoryMap, stStoryMapBuilder, stStoryMapBaseBuilder) {
        this.storyMap = new StoryMap({target: 'map'});
        var self = this;
        StoryPinLayerManager.storyPinsLayer = this.storyMap.storyPinsLayer;
        StoryBoxLayerManager.storyBoxesLayer = this.storyMap.storyBoxesLayer;
        this.loadMap = function(options) {
            options = options || {};
            if (options.id) {
                //var config = stMapConfigStore.loadConfig(options.id);
                stStoryMapBuilder.modifyStoryMap(self.storyMap, options);

                 var boxesURL = "/maps/" + options.id + "/boxes";//options.url.replace('/data','/boxes');
                if (boxesURL.slice(-1) === '/') {
                    boxesURL = boxesURL.slice(0, -1);
                }
                var boxesLoad = $http.get(boxesURL);

                var annotationsURL = "/maps/" + options.id + "/annotations";//options.url.replace('/data','/annotations');
                if (annotationsURL.slice(-1) === '/') {
                    annotationsURL = annotationsURL.slice(0, -1);
                }
                var annotationsLoad = $http.get(annotationsURL);
                $q.all([mapLoad, boxesLoad, annotationsLoad]).then(function(values) {
                    var boxes_geojson = values[1].data;
                    StoryBoxLayerManager.loadFromGeoJSON(boxes_geojson, self.storyMap.getMap().getView().getProjection());

                    var pins_geojson = values[2].data;
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, 'EPSG:4326');
                });


            } else if (options.url) {
                var mapLoad = $http.get(options.url).success(function(data) {
                    stStoryMapBuilder.modifyStoryMap(self.storyMap, data);
                }).error(function(data, status) {
                    if (status === 401) {
                        window.console.warn('Not authorized to see map ' + mapId);
                        stStoryMapBaseBuilder.defaultMap(self.storyMap);
                    }
                });

                var boxesURL = options.url.replace('/data','/boxes');
                if (boxesURL.slice(-1) === '/') {
                    boxesURL = boxesURL.slice(0, -1);
                }
                var boxesLoad = $http.get(boxesURL);

                var annotationsURL = options.url.replace('/data','/annotations');
                if (annotationsURL.slice(-1) === '/') {
                    annotationsURL = annotationsURL.slice(0, -1);
                }
                var annotationsLoad = $http.get(annotationsURL);
                $q.all([mapLoad, boxesLoad, annotationsLoad]).then(function(values) {
                    var boxes_geojson = values[1].data;
                    StoryBoxLayerManager.loadFromGeoJSON(boxes_geojson, self.storyMap.getMap().getView().getProjection());

                    var pins_geojson = values[2].data;
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, 'EPSG:4326');
                });


            } else {
                stStoryMapBaseBuilder.defaultMap(this.storyMap);
            }
            this.currentMapOptions = options;
            // @todo how to make on top?



            var element = document.getElementById('popup');

            var popup = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false
                });
            self.storyMap.getMap().addOverlay(popup);

            // display popup on click
            self.storyMap.getMap().on('click', function(evt) {
                var feature = self.storyMap.getMap().forEachFeatureAtPixel(evt.pixel,
                function(feature, layer) {
                return feature;
                });
            if (feature) {
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                $(element).popover('destroy');
                popup.setPosition(coord);
                $(element).popover({
                'placement': 'right',
                'html': true,
                'title': feature.get('title'),
                'content': feature.get('content')
                });
            $(element).popover('show');
            } else {
                $(element).popover('destroy');
                }
            });

        };
        /*
        $rootScope.$on('$locationChangeSuccess', function() {
            var path = $location.path();
            if (path === '/new') {
                self.loadMap();
            } else if (path.indexOf('/local') === 0) {
                self.loadMap({id: /\d+/.exec(path)});
            } else {
                self.loadMap({url: path});
            }
        });*/
        $rootScope.$on('$locationChangeSuccess', function() {
            {% autoescape off %}
            //var config = {"sources": {"0": {"id": "0", "ptype": "gx_olsource"}, "local": {"title": "", "url": "/geoserver/wms", "baseParams": {"VERSION": "1.1.1", "REQUEST": "GetCapabilities", "TILED": true, "SERVICE": "WMS"}, "ptype": "gxp_wmscsource", "restUrl": "/gs/rest", "id": "local"}}, "about": {"abstract": "Map represents the route of Matt Rutherford's solo journey around the Americas. \n\nhttp://www.solotheamericas.org/", "title": "Solo The Americas"}, "localGeoServerBaseUrl": "http://mapstory.org/geoserver/", "map": {"layers": [{"opacity": 1.0, "args": ["OpenStreetMap"], "group": "background", "name": "OpenStreetMap", "title": "OpenStreetMap", "selected": false, "visibility": true, "source": "0", "fixed": true, "type": "OpenLayers.Layer.OSM"}, {"opacity": 1.0, "args": ["No background"], "group": "background", "name": "No background", "title": "No background", "selected": false, "visibility": false, "source": "0", "fixed": true, "type": "OpenLayers.Layer"}, {"opacity": 1.0, "args": ["Satellite Imagery", "http://maps.opengeo.org/geowebcache/service/wms", {"layers": ["bluemarble"], "tiled": true, "tilesOrigin": [-20037508.34, -20037508.34], "format": "image/png"}, {"buffer": 0}], "group": "background", "name": "Satellite Imagery", "title": "Satellite Imagery", "selected": false, "visibility": false, "source": "0", "fixed": true, "type": "OpenLayers.Layer.WMS"}, {"opacity": 1.0, "args": ["Naked Earth", "http://maps.opengeo.org/geowebcache/service/wms", {"layers": ["Wayne"], "tiled": true, "tilesOrigin": [-20037508.34, -20037508.34], "format": "image/png"}, {"buffer": 0}], "group": "background", "name": "Naked Earth", "title": "Naked Earth", "selected": false, "visibility": false, "source": "0", "fixed": true, "type": "OpenLayers.Layer.WMS"}, {"opacity": 1.0, "styles": "geonode_Solo_Americas", "name": "geonode:Solo_Americas", "format": "image/png", "cached": true, "selected": true, "visibility": true, "capability": {"abstract": "This layer is a polyline route of Matt Rutherford's solo journey around the Americas. \n\nhttp://www.solotheamericas.org/", "nestedLayers": [], "cascaded": 0, "fixedHeight": 0, "prefix": "geonode", "keywords": [], "noSubsets": false, "dimensions": {}, "opaque": false, "tileSets": [{"layers": "geonode:Solo_Americas", "styles": "", "format": "image/jpeg", "height": 256, "srs": {"EPSG:900913": true}, "bbox": {"EPSG:900913": {"srs": "EPSG:900913", "bbox": [-20037508.34, -20037508.34, 20037508.345578495, 20037508.345578495]}}, "resolutions": [156543.033928041, 78271.516964020484, 39135.758482010227, 19567.879241005121, 9783.9396205025605, 4891.9698102512803, 2445.9849051256401, 1222.9924525628201, 611.49622628141003, 305.74811314070479, 152.87405657035251, 76.43702828517624, 38.218514142588127, 19.10925707129406, 9.5546285356470317, 4.7773142678235159, 2.3886571339117579, 1.194328566955879, 0.59716428347793948, 0.29858214173896974, 0.14929107086948487], "width": 256}], "infoFormats": ["text/plain", "application/vnd.ogc.gml", "application/vnd.ogc.gml/3.1.1", "text/html"], "styles": [{"abstract": "", "title": "A dark orange line style", "legend": {"height": "20", "width": "20", "href": "http://mapstory.org:80/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=Solo_Americas", "format": "image/png"}, "name": "geonode_Solo_Americas"}], "attribution": {"title": "admin"}, "authorityURLs": {}, "bbox": {"EPSG:4326": {"srs": "EPSG:4326", "bbox": [-168.41056485799999, -60.922531657999969, -24.649457550999948, 76.167003981000079]}}, "fixedWidth": 0, "metadataURLs": [{"href": "http://mapstory.org/geonetwork/srv/en/csw?outputschema=http%3A%2F%2Fwww.isotc211.org%2F2005%2Fgmd&service=CSW&request=GetRecordById&version=2.0.2&elementsetname=full&id=458c655c-7dd9-11e1-b0bf-6f01359b28bf", "type": "TC211", "format": "text/xml"}], "name": "geonode:Solo_Americas", "identifiers": {}, "srs": {"EPSG:900913": true}, "formats": ["image/png", "application/atom xml", "application/atom+xml", "application/openlayers", "application/pdf", "application/rss xml", "application/rss+xml", "application/vnd.google-earth.kml", "application/vnd.google-earth.kml xml", "application/vnd.google-earth.kml+xml", "application/vnd.google-earth.kml+xml;mode=networklink", "application/vnd.google-earth.kmz", "application/vnd.google-earth.kmz xml", "application/vnd.google-earth.kmz+xml", "application/vnd.google-earth.kmz;mode=networklink", "atom", "image/geotiff", "image/geotiff8", "image/gif", "image/gif;subtype=animated", "image/jpeg", "image/png8", "image/png; mode=8bit", "image/svg", "image/svg xml", "image/svg+xml", "image/tiff", "image/tiff8", "kml", "kmz", "openlayers", "rss"], "title": "Solo The Americas", "queryable": true, "llbbox": [-168.41056485799999, -60.922531657999969, -24.649457550999948, 76.167003981000079]}, "source": "local", "title": "Solo The Americas", "fixed": false, "transparent": true}, {"opacity": 1.0, "styles": "Solo_Americas1_89e01fce", "name": "geonode:Solo_Americas1", "format": "image/png", "cached": true, "selected": true, "visibility": true, "capability": {"abstract": "The layer is a polyline route of Matt Rutherford's solo journey around the Americas. \n\nhttp://www.solotheamericas.org/", "nestedLayers": [], "cascaded": 0, "fixedHeight": 0, "prefix": "geonode", "keywords": [], "noSubsets": false, "dimensions": {"time": {"nearestVal": false, "multipleVal": false, "name": "time", "default": "current", "current": false, "units": "ISO8601", "values": ["2011-06-13T00:00:00.000Z", "2011-06-18T00:00:00.000Z", "2011-06-23T00:00:00.000Z", "2011-06-27T00:00:00.000Z", "2011-07-01T00:00:00.000Z", "2011-07-03T00:00:00.000Z", "2011-07-07T00:00:00.000Z", "2011-07-10T00:00:00.000Z", "2011-07-13T00:00:00.000Z", "2011-07-16T00:00:00.000Z", "2011-07-19T00:00:00.000Z", "2011-07-22T00:00:00.000Z", "2011-07-25T00:00:00.000Z", "2011-07-28T00:00:00.000Z", "2011-07-31T00:00:00.000Z", "2011-08-03T00:00:00.000Z", "2011-08-06T00:00:00.000Z", "2011-08-09T00:00:00.000Z", "2011-08-12T00:00:00.000Z", "2011-08-16T00:00:00.000Z", "2011-08-19T00:00:00.000Z", "2011-08-22T00:00:00.000Z", "2011-08-25T00:00:00.000Z", "2011-08-28T00:00:00.000Z", "2011-08-31T00:00:00.000Z", "2011-09-03T00:00:00.000Z", "2011-09-06T00:00:00.000Z", "2011-09-09T00:00:00.000Z", "2011-09-12T00:00:00.000Z", "2011-09-15T00:00:00.000Z", "2011-09-18T00:00:00.000Z", "2011-09-21T00:00:00.000Z", "2011-09-24T00:00:00.000Z", "2011-09-27T00:00:00.000Z", "2011-09-30T00:00:00.000Z", "2011-10-02T00:00:00.000Z", "2011-10-05T00:00:00.000Z", "2011-10-08T00:00:00.000Z", "2011-10-11T00:00:00.000Z", "2011-10-14T00:00:00.000Z", "2011-10-17T00:00:00.000Z", "2011-10-20T00:00:00.000Z", "2011-10-23T00:00:00.000Z", "2011-10-26T00:00:00.000Z", "2011-10-29T00:00:00.000Z", "2011-11-01T00:00:00.000Z", "2011-11-04T00:00:00.000Z", "2011-11-07T00:00:00.000Z", "2011-11-10T00:00:00.000Z", "2011-11-13T00:00:00.000Z", "2011-11-16T00:00:00.000Z", "2011-11-19T00:00:00.000Z", "2011-11-22T00:00:00.000Z", "2011-11-25T00:00:00.000Z", "2011-11-28T00:00:00.000Z", "2011-12-01T00:00:00.000Z", "2011-12-04T00:00:00.000Z", "2011-12-07T00:00:00.000Z", "2011-12-10T00:00:00.000Z", "2011-12-13T00:00:00.000Z", "2011-12-16T00:00:00.000Z", "2011-12-19T00:00:00.000Z", "2011-12-22T00:00:00.000Z", "2011-12-25T00:00:00.000Z", "2011-12-28T00:00:00.000Z", "2012-01-01T00:00:00.000Z", "2012-01-05T00:00:00.000Z", "2012-01-08T00:00:00.000Z", "2012-01-11T00:00:00.000Z", "2012-01-14T00:00:00.000Z", "2012-01-17T00:00:00.000Z", "2012-01-20T00:00:00.000Z", "2012-01-23T00:00:00.000Z", "2012-01-26T00:00:00.000Z", "2012-01-29T00:00:00.000Z", "2012-02-01T00:00:00.000Z", "2012-02-04T00:00:00.000Z", "2012-02-07T00:00:00.000Z", "2012-02-10T00:00:00.000Z", "2012-02-13T00:00:00.000Z", "2012-02-15T00:00:00.000Z", "2012-02-18T00:00:00.000Z", "2012-02-21T00:00:00.000Z", "2012-02-24T00:00:00.000Z", "2012-02-27T00:00:00.000Z", "2012-03-01T00:00:00.000Z", "2012-03-04T00:00:00.000Z", "2012-03-07T00:00:00.000Z", "2012-03-10T00:00:00.000Z", "2012-03-13T00:00:00.000Z", "2012-03-16T00:00:00.000Z", "2012-03-19T00:00:00.000Z", "2012-03-22T00:00:00.000Z", "2012-03-25T00:00:00.000Z", "2012-03-28T00:00:00.000Z", "2012-04-02T00:00:00.000Z", "2012-04-05T00:00:00.000Z", "2012-04-08T00:00:00.000Z", "2012-04-11T00:00:00.000Z", "2012-04-14T00:00:00.000Z"], "unitsymbol": null}}, "opaque": false, "tileSets": [{"layers": "geonode:Solo_Americas1", "styles": "", "format": "image/jpeg", "height": 256, "srs": {"EPSG:900913": true}, "bbox": {"EPSG:900913": {"srs": "EPSG:900913", "bbox": [-20037508.34, -20037508.34, 20037508.345578495, 20037508.345578495]}}, "resolutions": [156543.033928041, 78271.516964020484, 39135.758482010227, 19567.879241005121, 9783.9396205025605, 4891.9698102512803, 2445.9849051256401, 1222.9924525628201, 611.49622628141003, 305.74811314070479, 152.87405657035251, 76.43702828517624, 38.218514142588127, 19.10925707129406, 9.5546285356470317, 4.7773142678235159, 2.3886571339117579, 1.194328566955879, 0.59716428347793948, 0.29858214173896974, 0.14929107086948487], "width": 256}], "infoFormats": ["text/plain", "application/vnd.ogc.gml", "application/vnd.ogc.gml/3.1.1", "text/html"], "styles": [{"abstract": "", "title": "A cyan line style", "legend": {"height": "20", "width": "20", "href": "http://mapstory.org:80/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=Solo_Americas1", "format": "image/png"}, "name": "geonode_Solo_Americas1"}], "attribution": {"title": "admin"}, "authorityURLs": {}, "bbox": {"EPSG:4326": {"srs": "EPSG:4326", "bbox": [-168.41056485799999, -60.922531657999969, -24.649457550999948, 76.167003981000079]}}, "fixedWidth": 0, "metadataURLs": [{"href": "http://mapstory.org/geonetwork/srv/en/csw?outputschema=http%3A%2F%2Fwww.isotc211.org%2F2005%2Fgmd&service=CSW&request=GetRecordById&version=2.0.2&elementsetname=full&id=3880c286-7de3-11e1-aae6-6f01359b28bf", "type": "TC211", "format": "text/xml"}], "name": "geonode:Solo_Americas1", "identifiers": {}, "srs": {"EPSG:900913": true}, "formats": ["image/png", "application/atom xml", "application/atom+xml", "application/openlayers", "application/pdf", "application/rss xml", "application/rss+xml", "application/vnd.google-earth.kml", "application/vnd.google-earth.kml xml", "application/vnd.google-earth.kml+xml", "application/vnd.google-earth.kml+xml;mode=networklink", "application/vnd.google-earth.kmz", "application/vnd.google-earth.kmz xml", "application/vnd.google-earth.kmz+xml", "application/vnd.google-earth.kmz;mode=networklink", "atom", "image/geotiff", "image/geotiff8", "image/gif", "image/gif;subtype=animated", "image/jpeg", "image/png8", "image/png; mode=8bit", "image/svg", "image/svg xml", "image/svg+xml", "image/tiff", "image/tiff8", "kml", "kmz", "openlayers", "rss"], "title": "Solo_Americas_Time_Enabled", "queryable": true, "llbbox": [-168.41056485799999, -60.922531657999969, -24.649457550999948, 76.167003981000079]}, "source": "local", "title": "Solo_Americas_Time_Enabled", "fixed": false, "transparent": true}], "wrapDateLine": false, "projection": "EPSG:900913", "center": [-7252987.7180500003, 1991335.5677199999], "zoom": 2, "units": "m", "maxResolution": 156543.03390625, "maxExtent": [-20037508.34, -20037508.34, 20037508.34, 20037508.34], "numZoomLevels": 22}, "defaultSourceType": "gxp_wmscsource", "apiKeys": {"google": "ABQIAAAAkofooZxTfcCv9Wi3zzGTVxTnme5EwnLVtEDGnh-lFVzRJhbdQhQgAhB1eT_2muZtc0dl-ZSWrtzmrw"}, "tools": null, "authorizedRoles": ["ROLE_ANONYMOUS"], "id": 133};
            var config = {{ config }}
            config.tools = [];
            var path = $location.path();
            if (path === '/new') {
                self.loadMap();
            } else if (path.indexOf('/local') === 0) {
                self.loadMap({id: /\d+/.exec(path)});
            } else {
                self.loadMap(config);
            }
            {% endautoescape %}
        });
    }

    module.service('MapManager', function($injector) {
        return $injector.instantiate(MapManager);
    });

    module.controller('tileProgressController', function($scope) {
        $scope.tilesToLoad = 0;
        $scope.tilesLoadedProgress = 0;
        $scope.$on('tilesLoaded', function(evt, remaining) {
            $scope.$apply(function () {
                if (remaining <= 0) {
                    $scope.tilesToLoad = 0;
                    $scope.tilesLoaded = 0;
                    $scope.tilesLoadedProgress = 0;
                } else {
                    if (remaining < $scope.tilesToLoad) {
                        $scope.tilesLoaded = $scope.tilesToLoad - remaining;
                        $scope.tilesLoadedProgress = Math.floor(100 * ($scope.tilesLoaded/($scope.tilesToLoad - 1)));
                    } else {
                        $scope.tilesToLoad = remaining;
                    }
                }
            });
        });
    });

    module.controller('viewerController', function($scope, $injector, MapManager, TimeControlsManager) {
        $scope.timeControlsManager = $injector.instantiate(TimeControlsManager);
        $scope.mapManager = MapManager;
        $scope.playbackOptions = {
            mode: 'instant',
            fixed: false
        };

    });
})();
</script>