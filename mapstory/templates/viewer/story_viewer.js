<script type="text/javascript">
      'use strict';

(function() {

    var module = angular.module('viewer', [
        'storytools.core.time',
        'storytools.core.mapstory',
        'storytools.core.pins',
        'storytools.core.boxes',
        'storytools.core.ogc',
        'storytools.core.legend',
        'loom_media_service',
        'ui.bootstrap'
    ]);

    module.constant('iconCommonsHost', 'http://mapstory.org');

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
                    // console.log(watchers);
                }
                last = watchers;
            }, 1000);

        })();
    });

    function MapManager($http, $q, $log, $rootScope, $location,
                        StoryMap, stStoryMapBuilder, stStoryMapBaseBuilder,
                        StoryPinLayerManager, StoryBoxLayerManager,
                        mediaService) {
        this.storyMap = new StoryMap({target: 'map', returnToExtent: true});
        var _config = {};
        this.title = "";
        this.owner = "";
        this.storyChapter = 1;
        this.chapterCount = 1;

        var self = this;
        StoryPinLayerManager.map = self.storyMap;
        StoryBoxLayerManager.map = self.storyMap;
        this.loadConfig = function(config, chapter){
            _config = config;
            if(config.chapters){
                self.chapterCount = config.chapters.length;
                if(chapter > 0 && chapter <= config.chapters.length) {
                    self.storyChapter = chapter;
                    $log.info("Loading Chapter " + chapter + " of " + config.chapters.length);
                    self.loadMap(config.chapters[chapter - 1]);
                }else{
                    $log.warn("Chapter " + chapter + " is INVALID so defaulting to Chapter 1. ");
                    self.loadMap(config.chapters[0]);
                }
            }else{
                $log.info("Story config has no chapters so just loading the defaults.");
                self.loadMap(config);
            }
            self.title = config.about.title;
            self.username = config.about.username;
            self.owner = config.about.owner;
            self.detail_url = config.about.detail_url;
        };

        this.displayPinInfo = function(pixel, pin) {
            var feature = null;
            var embed_params = {
              nowrap: 'on',
              maxwidth: 250,
              maxheight: 250
            };
            if (typeof(pin) == 'undefined' || pin == null) {
                feature = self.storyMap.getMap().forEachFeatureAtPixel(pixel,
                    function (feature, layer) {
                        return feature;
                    });
            } else {
                feature = pin;
            }
            if (feature) {
                var overlays = self.storyMap.getMap().getOverlays().getArray();
                var popup = null;
                var titleDescrip = '<div style="text-align:center;"><h4>' +
                                   feature.get('title') + '</h4></div><hr>' +
                                   feature.get('content');
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                for (var iOverlay = 0; iOverlay < overlays.length; iOverlay += 1) {
                    var overlay = overlays[iOverlay];
                    if ( overlay.getId && overlay.getId() == 'popup-' + feature.id) {
                        popup = overlay;
                        break;
                    }
                }

                if (popup === null) {
                    var popupOptions = {
                        insertFirst: false,
                        id: 'popup-' + feature.id,
                        positioning: 'bottom-center',
                        stopEvent: false
                    };
                    popup = new ol.Overlay.Popup(popupOptions);
                    self.storyMap.getMap().addOverlay(popup);
                    $rootScope.$broadcast('pausePlayback');
                }
                popup.setPosition(coord);
                if (feature.get('media')) {
                  mediaService.getEmbedContent(feature.get('media'), embed_params).then(function(result) {
                    var cont = result ? titleDescrip + result : titleDescrip;
                    popup.show(coord, cont);
                  });
                } else {
                  popup.show(coord, titleDescrip);
                }
            }
        };

        this.hidePinOverlay = function(pin) {
          var overlays = self.storyMap.getMap().getOverlays().getArray();
          for (var iOverlay = 0; iOverlay < overlays.length; iOverlay += 1) {
              var overlay = overlays[iOverlay];
              if (overlay.getId() == 'popup-' + pin.id) {
                var map = self.storyMap.getMap();
                map.removeOverlay(overlay);
              }
          }
        };

        this.loadMap = function(options) {
            options = options || {};
            if (options.id) {
                stStoryMapBuilder.modifyStoryMap(self.storyMap, options);

                var storypinsLoad = $http.get("/maps/" + options.id + "/storypins");
                var storyframesLoad = $http.get("/maps/" + options.id + "/storyframes");
                $q.all([storypinsLoad, storyframesLoad]).then(function(values) {
                    StoryPinLayerManager.loadFromGeoJSON(values[0].data, self.storyMap.getMap().getView().getProjection(), true);
                    StoryBoxLayerManager.loadFromGeoJSON(values[1].data, self.storyMap.getMap().getView().getProjection(), true);
                });
            } else {
                stStoryMapBaseBuilder.defaultMap(this.storyMap);
            }
            this.currentMapOptions = options;

            //var element = document.getElementById('story-pin-popup');

            /*var popup = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false
            });
            self.storyMap.getMap().addOverlay(popup);*/

            // display popup on hover
            self.storyMap.getMap().on('pointermove', function(evt) {
                if (evt.dragging){
                    return;
                }
                self.displayPinInfo(evt.pixel);
            });

            // display popup on click
            self.storyMap.getMap().on('click', function(evt) {
                self.displayPinInfo(evt.pixel);
            });
        };
        $rootScope.$on('$locationChangeSuccess', function() {
            var config = {% autoescape off %}{{ config }};{% endautoescape%}
        var path = $location.path(), chapter = 1, matches;

        if (path.indexOf('/chapter') === 0){
            if ((matches = /\d+/.exec(path)) !== null) {
                chapter = matches[0]
            }
        }

        self.loadConfig(config, chapter);
    });

    $rootScope.$on('showPin', function(event, pin) {
      self.displayPinInfo(null, pin);
    });

    $rootScope.$on('rangeChange', function(event, range) {
      StoryPinLayerManager.autoDisplayPins(range);
    });

    $rootScope.$on('hidePinOverlay', function(event, pin) {
      self.hidePinOverlay(pin);
    });

    $rootScope.$on('hidePinOverlay', function(event, pin) {
        self.hidePinOverlay(pin);
    });
}

/* EXACTLY THE SAME AS LAYER VIEWER */
module.service('MapManager', function($injector) {
    return $injector.instantiate(MapManager);
});

/* EXACTLY THE SAME AS LAYER VIEWER */
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


module.controller('viewerController', function($scope, $location, $injector, $log, MapManager, TimeControlsManager) {
    $scope.timeControlsManager = $injector.instantiate(TimeControlsManager);
    $scope.mapManager = MapManager;

    var values = {storypins: [], storyframes: [], data: []};

    $scope.nextChapter = function(){
        var nextChapter = Number(MapManager.storyChapter) + 1;
        if(nextChapter <= MapManager.chapterCount) {
            $log.info("Going to Chapter ", nextChapter);
            $scope.timeControlsManager.timeControls.update(values);
            $location.path('/chapter/' + nextChapter);
        }else{
            $location.path('');
        }
    };

    $scope.previousChapter = function(){
        var previousChapter = Number(MapManager.storyChapter) - 1;
        if(previousChapter > 0) {
            $log.info("Going to the Chapter ", previousChapter);
            $scope.timeControlsManager.timeControls.update(values);
            $location.path('/chapter/' + previousChapter);
        }else{
            $location.path('');
        }
    };
    
    $scope.toggleSidebar = function() {
        $scope.isShown = !$scope.isShown;
        var sidebar = document.querySelector('#sidebar');
        $scope.isShown ? sidebar.className = "sidebarHidden" : sidebar.className = "sidebar";
    };

});
})();
</script>
