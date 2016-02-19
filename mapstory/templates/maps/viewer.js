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
                        StoryMap, stStoryMapBuilder, stStoryMapBaseBuilder, StoryPinLayerManager) {
        this.storyMap = new StoryMap({target: 'map'});
        var self = this;
        this.loadMap = function(options) {
            options = options || {};
            if (options.id) {
                var config = options;
                stStoryMapBuilder.modifyStoryMap(self.storyMap, config);

                var annotationsURL = "/maps/" + options.id + "/annotations";
                if (annotationsURL.slice(-1) === '/') {
                    annotationsURL = annotationsURL.slice(0, -1);
                }
                var annotationsLoad = $http.get(annotationsURL);
                $q.all([annotationsLoad]).then(function(values) {
                    var pins_geojson = values[0].data;
                    StoryPinLayerManager.loadFromGeoJSON(pins_geojson, self.storyMap.getMap().getView().getProjection());
                });
            } else {
                stStoryMapBaseBuilder.defaultMap(this.storyMap);
            }
            this.currentMapOptions = options;
        };
        $rootScope.$on('$locationChangeSuccess', function() {
            var config = {% autoescape off %}{{ config }};{% endautoescape%}
            self.loadMap(config);
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
