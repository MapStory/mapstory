<script type="text/javascript">
'use strict';

(function() {

    var module = angular.module('viewer', [
        'storytools.core.time',
        'storytools.core.mapstory',
        'storytools.core.pins',
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
        StoryPinLayerManager, stMapConfigStore, StoryMap, stStoryMapBuilder, stStoryMapBaseBuilder) {
        this.storyMap = new StoryMap({target: 'map'});
        var self = this;
        StoryPinLayerManager.storyPinsLayer = this.storyMap.storyPinsLayer;
        this.loadMap = function(options) {
            options = options || {};

            if (options.chapter != undefined){
                self.current_chapter = options.chapter;
                console.log("current chapter", self.current_chapter);
                self.c_chapter = options.chapter + 1;
            }

            if (options.id) {
                stStoryMapBuilder.modifyStoryMap(self.storyMap, options);

                var annotationsURL = "/maps/" + options.id + "/annotations";
                if (annotationsURL.slice(-1) === '/') {
                    annotationsURL = annotationsURL.slice(0, -1);
                }
                var annotationsLoad = $http.get(annotationsURL);
                $q.all([annotationsLoad]).then(function(values) {
                    var pins_geojson = values[0].data;
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, self.storyMap.getMap().getView().getProjection());
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

                var annotationsURL = options.url.replace('/data','/annotations');
                if (annotationsURL.slice(-1) === '/') {
                    annotationsURL = annotationsURL.slice(0, -1);
                }
                var annotationsLoad = $http.get(annotationsURL);
                $q.all([mapLoad, annotationsLoad]).then(function(values) {
                    var pins_geojson = values[1].data;
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, self.storyMap.getMap().getView().getProjection());
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