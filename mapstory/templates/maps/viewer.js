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
                    console.log(watchers);
                }
                last = watchers;
            }, 1000);

        })();
    });

    function MapManager($http, $q, $log, $rootScope, $location,
                        StoryMap, stStoryMapBuilder, stStoryMapBaseBuilder, StoryPinLayerManager, StoryBoxLayerManager) {
        this.storyMap = new StoryMap({target: 'map'});
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
            self.owner = config.about.owner;
        };

        this.loadMap = function(options) {
            options = options || {};
            if (options.id) {
                stStoryMapBuilder.modifyStoryMap(self.storyMap, options);

                var annotationsLoad = $http.get("/maps/" + options.id + "/annotations");
                var boxesLoad = $http.get("/maps/" + options.id + "/boxes");
                $q.all([annotationsLoad, boxesLoad]).then(function(values) {
                    StoryPinLayerManager.loadFromGeoJSON(values[0].data, self.storyMap.getMap().getView().getProjection(), true);
                    StoryBoxLayerManager.loadFromGeoJSON(values[1].data, self.storyMap.getMap().getView().getProjection(), true);
                });
            } else {
                stStoryMapBaseBuilder.defaultMap(this.storyMap);
            }
            this.currentMapOptions = options;

            var element = document.getElementById('story-pin-popup');

            var popup = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false
            });
            self.storyMap.getMap().addOverlay(popup);

            var displayPinInfo = function(pixel){
                var feature = self.storyMap.getMap().forEachFeatureAtPixel(pixel,
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
                        'content': feature.get('content') + feature.get('media')
                    });
                    $(element).popover('show');
                } else {
                    $(element).popover('destroy');
                }
            };

            // display popup on hover
            self.storyMap.getMap().on('pointermove', function(evt) {
                if (evt.dragging){
                    return;
                }
                displayPinInfo(evt.pixel);
            });

            // display popup on click
            self.storyMap.getMap().on('click', function(evt) {
                displayPinInfo(evt.pixel);
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

module.controller('viewerController', function($scope, $location, $injector, $log, MapManager, TimeControlsManager) {
    $scope.timeControlsManager = $injector.instantiate(TimeControlsManager);
    $scope.mapManager = MapManager;

    var values = {annotations: [], boxes: [], data: []};

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

    $scope.playbackOptions = {
        mode: 'instant',
        fixed: false
    };

});
})();
</script>
