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

  function MapManager($rootScope, StoryMap, stStoryMapBaseBuilder, stEditableLayerBuilder, $log) {
    this.storyMap = new StoryMap({target: 'map'});
    var self = this;

    this.loadMap = function(options) {
      options = options || {};
      stStoryMapBaseBuilder.defaultMap(this.storyMap);
      stStoryMapBaseBuilder.setBaseLayer(this.storyMap, options);
    };

    this.addLayer = function(name, asVector, server, fitExtent, styleName, title) {
      if (fitExtent === undefined) {
        fitExtent = true;
      }
      if (angular.isString(server)) {
        server = { path: server}
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
        type: (asVector === true) ? 'VECTOR': 'WMS'
      };
      return stEditableLayerBuilder.buildEditableLayer(options, self.storyMap.getMap()).then(function(a) {
        self.storyMap.addStoryLayer(a);
        var map = self.storyMap.getMap();
        if (fitExtent === true) {
          var extent = ol.proj.transformExtent(
                a.get('latlonBBOX'),
                'EPSG:4326',
                self.storyMap.getMap().getView().getProjection()
          );

          // prevent getting off the earth
          extent[1] = Math.max(-20037508.34, Math.min(extent[1], 20037508.34));
          extent[3] = Math.max(-20037508.34, Math.min(extent[3], 20037508.34));

          var isInvalid = extent.some(function(a){
            return isNaN(a);

          });

          if(isInvalid){
            extent = a.get('latlonBBOX');
          }

          map.getView().fit(extent, map.getSize());

          self.storyMap.setCenter(map.getView().getCenter());
          self.storyMap.setZoom(map.getView().getZoom());

        }
      });
    };
  }

/* EXACTLY THE SAME AS STORY VIEWER */
  module.service('MapManager', function($injector) {
    return $injector.instantiate(MapManager);
  });
/* EXACTLY THE SAME AS STORY VIEWER */
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

  module.controller('viewerController', function($scope, $location, $injector, $log, MapManager, TimeControlsManager, $modal) {
    $scope.timeControlsManager = $injector.instantiate(TimeControlsManager);
    $scope.mapManager = MapManager;

    $scope.mapManager.loadMap({title: 'OpenStreetMap', type: 'OSM'});

    $scope.loading = true;
    $scope.mapManager.addLayer('{{resource.typename}}', false, '/geoserver/').then(function() {
      // pass
    }, function(problems) {
      var msg = 'Something went wrong:';
      if (problems[0].status == 404 || problems[0].status == 502 || problems[0].status == 500) {
        msg = "<div class='alert alert-danger' style='margin-bottom:0'>" +
              "<span class='glyphicon glyphicon-exclamation-sign' style='padding-right: 6px;' aria-hidden='true'></span>" +
              "<span>" +
              "The mapping server did not respond properly. It is likely temporarily down, " +
              "but should be up soon. If this problem persists please let the administrators know." +
              "</span></div>";
      }
      $modal.open({
        template: msg
      });
      $log.warn(problems);
    }).finally(function() {
      $scope.loading = false;
    });

    $scope.playbackOptions = {
      mode: 'instant',
      fixed: false
    };

  });
})();
</script>