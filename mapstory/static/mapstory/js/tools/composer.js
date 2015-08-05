'use strict';

(function() {

    var module = angular.module('composer', [
        'storytools.core.time',
        'storytools.core.mapstory',
        'storytools.edit.style',
        'storytools.edit.boxes',
        'storytools.core.boxes',
        'storytools.edit.pins',
        'storytools.core.ogc',
        'colorpicker.module',
        'geonode_main_search',
        'ui.bootstrap',
        "angular-sortable-view"
    ]);

    module.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }]);


    module.constant('Configs', {
            url: SEARCH_URL,
            disableQuerySync: true
    });

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

    var servers = [
        {
            name: 'Explore All',
            path: '/geoserver/',
            absolutePath: 'http://mapstory.beta.boundlessgeo.com/geoserver/',
            canStyleWMS: true
        },
        {
            name: 'Common',
            path: '/geoserver/',
            canStyleWMS: true
        },
        {
            name: 'My Favorites',
            path: '/geoserver/',
            canStyleWMS: true
        },
        {
            name: 'My Uploads',
            path: '/geoserver/',
            canStyleWMS: true
        }
    ];

    function getServer(name) {
        var server = null;
        for (var i = 0; i < servers.length; i++) {
            if (servers[i].name === name) {
                server = servers[i];
                break;
            }
        }
        if (server === null) {
            throw new Error('no server named : ' + name);
        }
        return server;
    }

    function MapManager($log, $http, $q, $rootScope, $location,
        StoryPinLayerManager, StoryBoxLayerManager, stMapConfigStore, stAnnotationsStore, stBoxesStore, stEditableLayerBuilder, EditableStoryMap, stStoryMapBaseBuilder, stEditableStoryMapBuilder) {
        this.storyMap = new EditableStoryMap({target: 'map'});
        window.storyMap = this.storyMap;
        var self = this;
        StoryPinLayerManager.storyPinsLayer = this.storyMap.storyPinsLayer;
        StoryBoxLayerManager.storyBoxesLayer = this.storyMap.storyBoxesLayer;
        this.loadMap = function(options) {
            options = options || {};
            if (options.id) {
                var config = stMapConfigStore.loadConfig(options.id);
                stEditableStoryMapBuilder.modifyStoryMap(self.storyMap, config);
                var annotations = stAnnotationsStore.loadAnnotations(options.id);
                StoryPinLayerManager.pinsChanged(annotations, 'add', true);
                var boxes = stBoxesStore.loadBoxes(options.id);
                StoryBoxLayerManager.boxesChanged(boxes, 'add', true);
            } else if (options.url) {
                var mapLoad = $http.get(options.url).success(function(data) {
                    stEditableStoryMapBuilder.modifyStoryMap(self.storyMap, data);
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
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, self.storyMap.getMap().getView().getProjection());
                });
            } else {

                if(window.config){
                    stEditableStoryMapBuilder.modifyStoryMap(self.storyMap, window.config);
                }else{
                    stStoryMapBaseBuilder.defaultMap(self.storyMap);
                }
            }
            this.currentMapOptions = options;
        };

        this.saveMap = function() {

            var deferred = $q.defer();
            var self = this;
            var config = this.storyMap.getState();
            config.boxes = StoryBoxLayerManager.storyBoxes;

            var end_point = '/maps/new/data';

            if(config.id != undefined && config.id != null && config.id > 0){
                end_point = '/maps/' + config.id + '/data';
                var mapLoad = $http.post(end_point, storytools.mapstory.MapConfigTransformer.MapToGXPConfigTransformer(config));
            }else{

                var mapLoad = $http.post(end_point, storytools.mapstory.MapConfigTransformer.MapToGXPConfigTransformer(config)).success(function(data) {

                    var mapId = data.id;

                    self.storyMap.set('id', mapId);

                    stBoxesStore.saveBoxes(mapId, StoryBoxLayerManager.storyBoxes)
                        .success(function(data) { $log.debug("StoryBoxes Saved: " + data);  }).error(function(data, status) {
                            if (status === 401) {

                            }
                        });

                    stAnnotationsStore.saveAnnotations(mapId, StoryPinLayerManager.storyPins)
                        .success(function(data) { $log.debug("StoryPins Saved: " + data);  }).error(function(data, status) {
                            if (status === 401) {
                                window.console.warn('Not authorized to see map ' + mapId);
                                stStoryMapBaseBuilder.defaultMap(self.storyMap);
                            }
                        });





                }).error(function(data, status) {
                        if (status === 401) {
                            window.console.warn('Not authorized to see map ' + mapId);
                            stStoryMapBaseBuilder.defaultMap(self.storyMap);
                        }
                        else if(status === 500){
                            window.console.warn('Unable to save map.');
                        }
                    });

                //stMapConfigStore.saveConfig(config_json);
            }

            return deferred.promise;

        };
        $rootScope.$on('$locationChangeSuccess', function() {
            var path = $location.path();
            if (path === '/new') {
                self.loadMap();
            } else if (path.indexOf('/local') === 0) {
                self.loadMap({id: /\d+/.exec(path)});
            } else {
                self.loadMap({url: path});
            }
        });
        this.addLayer = function(name, asVector, server, fitExtent, styleName, title) {
            if (fitExtent === undefined) {
                fitExtent = true;
            }
            if (angular.isString(server)) {
                server = getServer(server);
            }
            var workspace = 'geonode';
            var parts = name.split(':');
            if (parts.length > 1) {
                workspace = parts[0];
                name = parts[1];
            }
            var url = server.path + workspace + '/' + name + '/wms';
            var id = workspace + ":" + name;
            var options = {
              id: id,
              name: name,
              title: title || name,
              url: url,
              path: server.path,
              canStyleWMS: server.canStyleWMS,
              timeEndpoint: server.timeEndpoint ? server.timeEndpoint(name): undefined,
              type: (asVector === true) ? 'VECTOR': 'WMS'
            };
            return stEditableLayerBuilder.buildEditableLayer(options, self.storyMap.getMap()).then(function(a) {
              self.storyMap.addStoryLayer(a);
              if (fitExtent === true) {
                a.get('latlonBBOX');
                var extent = ol.proj.transformExtent(
                  a.get('latlonBBOX'),
                  'EPSG:4326',
                  self.storyMap.getMap().getView().getProjection()
                );
                // prevent getting off the earth
                extent[1] = Math.max(-20037508.34, Math.min(extent[1], 20037508.34));
                extent[3] = Math.max(-20037508.34, Math.min(extent[3], 20037508.34));
                self.storyMap.getMap().getView().fitExtent(extent, self.storyMap.getMap().getSize());
              }
            });
        };
    }

    module.service('styleUpdater', function($http, ol3StyleConverter) {
        return {
            updateStyle: function(storyLayer) {
                var style = storyLayer.get('style'), layer = storyLayer.getLayer();
                var isComplete = new storytools.edit.StyleComplete.StyleComplete().isComplete(style);
                if (isComplete && layer instanceof ol.layer.Vector) {
                    layer.setStyle(function(feature, resolution) {
                        return ol3StyleConverter.generateStyle(style, feature, resolution);
                    });
                } else {
                    // this case will happen if canStyleWMS is false for the server
                    if (storyLayer.get('styleName')) {
                        if (isComplete) {
                            var sld = new storytools.edit.SLDStyleConverter.SLDStyleConverter();
                            var xml = sld.generateStyle(style, layer.getSource().getParams().LAYERS, true);
                            $http({
                                url: '/geoserver/rest/styles/' + storyLayer.get('styleName') + '.xml',
                                method: "PUT",
                                data: xml,
                                headers: {'Content-Type': 'application/vnd.ogc.sld+xml; charset=UTF-8'}
                            }).then(function(result) {
                                layer.getSource().updateParams({"_olSalt": Math.random()});
                            });
                        }
                    }
                }
            }
        };
    });

    module.service('MapManager', function($injector) {
        return $injector.instantiate(MapManager);
    });

    module.directive('storyAboutInfo', function($modal, $timeout, $log, MapManager) {
        return {
            restrict: 'E',
            scope: {
                map: "="
            },
            templateUrl: 'templates/story-about-info.html',
            link: function(scope, el, atts) {

                scope.choice = {"title": MapManager.storyMap.getStoryTitle(), "abstract": MapManager.storyMap.getStoryAbstract()};

                scope.saveMap = function(about) {
                    scope.loading = true;

                    //$timeout(function(){scope.$parent.status.open = false;scope.loading = false;}, 3000);

                     MapManager.storyMap.setStoryTitle(about.title);
                     MapManager.storyMap.setStoryAbstract(about.abstract);
                     MapManager.saveMap();
                     scope.$parent.status.open = false;
                     scope.loading = false;
                };
            }
        };
    });

    module.directive('addLayers', function($modal, $log, MapManager, loadSearchDialog) {
        return {
            restrict: 'E',
            scope: {
                map: "="
            },
            templateUrl: 'templates/add-layers.html',
            link: function(scope, el, atts) {
                scope.server = {
                    active: servers[0]
                };
                scope.servers = servers;

                scope.showLoadSearchDialog = function() {
                    var promise = loadSearchDialog.show();
                    promise.then(function(results) {

                        if (results) {

                            angular.forEach(results, function(layerName) {
                                       MapManager.addLayer(layerName,false, servers[0]);
                            });
                        }
                    });
                };


                scope.addLayer = function() {
                    scope.loading = true;
                    MapManager.addLayer(this.layerName, this.asVector, scope.server.active).then(function() {
                        // pass
                    }, function(problems) {
                        var msg = 'Something went wrong:';
                        if (problems[0].status == 404) {
                            msg = 'Cannot find the specified layer:';
                        }
                        msg += problems[0].data;
                        $modal.open({
                            template: msg
                        });
                        $log.warn(problems);
                    }).finally(function() {
                        scope.loading = false;
                    });
                    scope.layerName = null;
                };
            }
        };
    });

    module.directive('layerList', function(stStoryMapBaseBuilder, stEditableStoryMapBuilder, MapManager) {
        return {
            restrict: 'E',
            scope: {
                map: "="
            },
            templateUrl: 'templates/layer-list.html',
            link: function(scope, el, atts) {
                scope.baseLayers = [{
                    title: 'World Light',
                    type: 'MapBox',
                    name: 'world-light'
                }, {
                    title: 'Geography Class',
                    type: 'MapBox',
                    name: 'geography-class'
                }, {
                    title: 'Natural Earth 2',
                    type: 'MapBox',
                    name: 'natural-earth-2'
                }, {
                    title: 'Natural Earth',
                    type: 'MapBox',
                    name: 'natural-earth-1'
                }, {
                    title: 'Satellite Imagery',
                    type: 'MapQuest',
                    layer: 'sat'
                }, {
                    title: 'Humanitarian OpenStreetMap',
                    type: 'HOT'
                }, {
                    title: 'OpenStreetMap',
                    type: 'OSM'
                }, {
                    title: 'No background',
                    type: 'None'
                }];



                var baseLayer = MapManager.storyMap.get('baselayer');
                if (baseLayer) {
                    scope.baseLayer = baseLayer.get('title');
                }

                MapManager.storyMap.on('change:baselayer', function() {
                    scope.baseLayer = MapManager.storyMap.get('baselayer').get('title');
                });
                MapManager.storyMap.getStoryLayers().on('change:length', function() {
                    scope.layers = MapManager.storyMap.getStoryLayers().getArray();
                });

                scope.toggleVisibleLayer = function(lyr) {
                    MapManager.storyMap.toggleStoryLayer(lyr);
                };
                scope.removeLayer = function(lyr) {
                    MapManager.storyMap.removeStoryLayer(lyr);
                };
                scope.modifyLayer = function(lyr) {
                    stEditableStoryMapBuilder.modifyStoryLayer(MapManager.storyMap, lyr);
                };
                scope.onChange = function(baseLayer) {
                    stStoryMapBaseBuilder.setBaseLayer(MapManager.storyMap, baseLayer);
                };

                scope.onSort = function(item, partFrom, partTo, indexFrom, indexTo){
                  console.log("Changed layer position of " + item.get('title')
                      + " FROM " + indexFrom
                      + " TO " + indexTo);

                  partFrom.forEach(function(layer) {
                      //console.log(layer.get('title'));
                  });

                  partTo.forEach(function(layer) {
                      //console.log(layer.get('title'));
                  });
                };
            }
        };
    });

    module.service('loadMapDialog', function($modal, $rootScope, stMapConfigStore) {
        function show() {
            var scope = $rootScope.$new(true);
            scope.maps = stMapConfigStore.listMaps();
            scope.choice = {};
            return $modal.open({
                templateUrl: 'templates/load-map-dialog.html',
                scope: scope
            }).result.then(function() {
                return scope.choice;
            });
        }
        return {
            show: show
        };
    });


    module.service('loadNewMapDialog', function($modal, $rootScope, stMapConfigStore) {
        function show() {
            var scope = $rootScope.$new(true);
            scope.choice = {};
            return $modal.open({
                templateUrl: 'templates/load-new-map-dialog.html',
                scope: scope
            }).result.then(function() {
                return scope.choice;
            });
        }
        return {
            show: show
        };
    });

    module.service('loadSearchDialog', function($modal, $rootScope, stMapConfigStore) {
        function show() {
            var scope = $rootScope.$new(true);

            scope.choices = [];

            scope.result_select = function($event, layer){
                var element = $($event.target);

                //TODO: would prefer to call layer.name but arg is base_resourcebase
                //instead need to parse the name from the url

                var layerName = decodeURIComponent(layer.detail_url);

                if(layerName.indexOf('/layers/') > -1){
                    layerName = layerName.replace("/layers/","");
                }


                var box = $(element.parents('.box')[0]);

                if (box.hasClass('resource_selected')){
                    var index = scope.choices.indexOf(layerName);

                    if (index > -1) {
                        scope.choices.splice(index, 1);
                    }

                    element.html('Select');
                    box.removeClass('resource_selected');
                }
                else{
                    scope.choices.push(layerName);
                    element.html('Deselect');
                    box.addClass('resource_selected');
                }
            };

            return $modal.open({
                templateUrl: 'templates/load-search-dialog.html',
                scope: scope
            }).result.then(function() {
                return scope.choices;
            });
        }
        return {
            show: show
        };
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

    module.controller('composerController', function($scope, $injector, MapManager, TimeControlsManager,
        styleUpdater, loadMapDialog, loadNewMapDialog, loadSearchDialog, $location) {

        $scope.mapManager = MapManager;
        $scope.timeControlsManager = $injector.instantiate(TimeControlsManager);
        $scope.playbackOptions = {
            mode: 'instant',
            fixed: false
        };

        $scope.saveMap = function() {
            MapManager.saveMap();
        };
        $scope.newMap = function() {
           // $location.path('/new');

            var promise = loadNewMapDialog.show();
            promise.then(function(config) {
                    MapManager.storyMap.setMetadata(config);
            });
        };

        $scope.styleChanged = function(layer) {
            styleUpdater.updateStyle(layer);
        };
        $scope.showLoadMapDialog = function() {
            var promise = loadMapDialog.show();
            promise.then(function(result) {
                if (result.mapstoryMapId) {
                    $location.path('/maps/' + result.mapstoryMapId + "/data/");
                } else if (result.localMapId) {
                    $location.path('/local/' + result.localMapId);
                }
            });
        };

        // strip features from properties to avoid circular dependencies in debug
        $scope.layerProperties = function(lyr) {
            var props = lyr.getProperties();
            var features = delete props.features;
            props.featureCount = (features || []).length;
            return props;
        };
    });
})();
