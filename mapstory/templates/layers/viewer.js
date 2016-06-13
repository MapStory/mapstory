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

  function MapManager($rootScope,
                      StoryMap, stEditableStoryMapBuilder) {
    this.storyMap = new StoryMap({target: 'map'});
    var _config = {};
    var self = this;
    this.loadConfig = function(config){
      _config = config;
      self.loadMap(config);
    };

    this.loadMap = function(options) {
      options = options || {};

      stEditableStoryMapBuilder.modifyStoryMap(self.storyMap, options);

      this.currentMapOptions = options;

    };
    $rootScope.$on('$locationChangeSuccess', function() {
      var config = {% autoescape off %}{{ viewer|safe }};{% endautoescape%}
      self.loadConfig(config);
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

    $scope.playbackOptions = {
      mode: 'instant',
      fixed: false
    };

  });
})();
</script>
