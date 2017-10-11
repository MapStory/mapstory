/*
 *  CreateLayer & CreateLayerModal
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('createLayerCtrl', createLayerCtrl)
    .controller('createLayerModalCtrl', createLayerModalCtrl);

  function createLayerCtrl($scope, $uibModal) {
    $scope.open = function (templateUrl, modalImage, staticUrl) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: templateUrl || 'importWizard.html',
        controller:  'createLayerModalCtrl',
        resolve: {
          modalImage: function () {
            return modalImage;
          },
          staticUrl: function () {
            return staticUrl;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    };
  }

  function createLayerModalCtrl($scope, $modalInstance, $http, modalImage, staticUrl) {
    $scope.staticUrl = staticUrl;
    $scope.modalImage = modalImage;
    $scope.processing = false;
    $scope.layer = {
       configuration_options: {
         attributes: {
           attribute: [
             {   name: "geometry",
                 "binding": "com.vividsolutions.jts.geom.Point",
                 "minOccurs": 0,
                 "nillable": true
             },
             {   name: 'time',
                 binding: 'org.geotools.data.postgis.BigDate',
                 nillable: true,
                 minOccurs: 0
             }
           ]
         },
         nativeCRS: 'EPSG:4326',
         srs: 'EPSG:4326',
         store: {name: 'mapstory_geogig'},
         namespace: {'name': 'geonode'},
         configureTime: true,
         editable: true
        }
      };

    $scope.defaultAttribute = {'name':'', 'binding':'', nillable: true, minOccurs: 0};
    $scope.geometryTypes = [
     {'label': 'Point', 'value': 'com.vividsolutions.jts.geom.Point'},
     {'label': 'Line', 'value': 'com.vividsolutions.jts.geom.LineString'},
     {'label': 'Polygon', 'value': 'com.vividsolutions.jts.geom.Polygon'},
     {'label': 'Geometry', 'value': 'com.vividsolutions.jts.geom.Geometry'},
     {'label': 'Multi-Point', 'value': 'com.vividsolutions.jts.geom.MultiPoint'},
     {'label': 'Multi-Line', 'value': 'com.vividsolutions.jts.geom.MultiLineString'},
     {'label': 'Multi-Polygon', 'value': 'com.vividsolutions.jts.geom.MultiPolygon'},
     {'label': 'Multi-Geometry', 'value': 'com.vividsolutions.jts.geom.MultiGeometry'}
    ];

    $scope.attributeTypes = [
     {'label': 'Text', 'value': 'java.lang.String'},
     {'label': 'Number', 'value': 'java.lang.Double'},
     {'label': 'Date', 'value': 'org.geotools.data.postgis.BigDate'},
    ];

    $scope.createLayer = function() {
      $scope.processing = true;
      $scope.errors = [];
      $scope.setDefaultPermissions($scope.layer.configuration_options.editable);
      $http.post('/layers/create', {'featureType': $scope.layer.configuration_options}).then(function(response){
        $scope.processing = false;
        $scope.success = true;
        $scope.created_layers = response['data']['layers'];
      }, function(response){
        $scope.processing = false;
        $scope.errors = response['data']['errors'];
      })
     };

    $scope.setDefaultPermissions = function(edit) {
      $scope.layer.configuration_options.permissions = {
        'users': {'AnonymousUser': ['change_layer_data', 'download_resourcebase', 'view_resourcebase']},
        'groups': {'registered': ['change_layer_data', 'download_resourcebase', 'view_resourcebase']}
      };

      if(edit === false) {
        $scope.layer.configuration_options.permissions = {
          'users': {'AnonymousUser': ['download_resourcebase', 'view_resourcebase']},
          'groups': {'registered': ['download_resourcebase', 'view_resourcebase']}
        };
       }
       $scope.layer.configuration_options.storeCreateGeogig = true;
    };

    $scope.addDefaultAttribute = function() {
      $scope.layer.configuration_options.attributes.attribute.push(angular.copy($scope.defaultAttribute));
    };

    $scope.remove = function(item) {
      var index = $scope.layer.configuration_options.attributes.attribute.indexOf(item);
      $scope.layer.configuration_options.attributes.attribute.splice(index, 1);
    };

    $scope.nameValid = function() {
      if (!$scope.layer.configuration_options.hasOwnProperty('name')) {
        return false;
      }
      return true;
    };

    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
})();