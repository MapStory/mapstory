'use strict';

(function() {

  var httpService_ = null;
  var layerService_ = null;
  var q_ = null;

  angular.module('mapstory.uploader', [
      'ngResource',
      'ui.bootstrap',
      'mapstory.factories',
      'angularFileUpload',
      'ngCookies',
      'mgo-angular-wizard'
  ])

  .config(function($interpolateProvider, $httpProvider, $sceDelegateProvider) {
    //$interpolateProvider.startSymbol('{[');
    //$interpolateProvider.endSymbol(']}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://mapstory-static.s3.amazonaws.com/**',
    'https://mapstory-static.s3.amazonaws.com/**'
  ]);
  })

  .provider('layerService', function() {

    this.$get = function($http, $q) {
      httpService_ = $http;
      q_ = $q;
      layerService_ = this;
      return this;
    };

    this.validateConfigurationOptions = function(layer) {
      layer.configuration_options = layer.configuration_options || {};

      if (!layer.hasOwnProperty('index') === true) {
          layer['index'] = index;
      }

      var checkStartDate = layer.configuration_options.hasOwnProperty('start_date') && layer.configuration_options.start_date != "";
      var checkEndDate = layer.configuration_options.hasOwnProperty('end_date') && layer.configuration_options.end_date != "";
      var dates = [];
      layer.configuration_options.convert_to_date = [];

      if (layer.configuration_options.editable === true) {
         layer.configuration_options.geoserver_store = {'type': 'geogig'};
      } else {
         delete layer.configuration_options.geoserver_store;
      }

      if ((checkStartDate === true || checkEndDate == true)
          && layer.configuration_options.configureTime === true) {
          for (var i = 0; i < layer.fields.length; i++) {

              var fieldType = layer.fields[i]['type'];
                if (fieldType === 'Date' || fieldType === 'DateTime') {
                    dates.push(layer.fields[i]['name']);
                }
          }

          if (checkStartDate === true && dates.indexOf(layer.configuration_options['start_date']) == -1) {
            layer.configuration_options.convert_to_date.push(layer.configuration_options['start_date']);
          }

          if (checkEndDate === true && dates.indexOf(layer.configuration_options['end_date']) == -1) {
            layer.configuration_options.convert_to_date.push(layer.configuration_options['end_date']);
          }
      } else {
          layer.configuration_options['start_date'] = null;
          layer.configuration_options['end_date'] = null;
        }

      return layer;

    };

    this.configureUpload = function(layer) {
      var deferredResponse = q_.defer();
      this.validateConfigurationOptions(layer);
      httpService_.post(layer.resource_uri + 'configure/', layer.configuration_options).success(function(data, status) {
        // extend current object with get request to resource_uri
        deferredResponse.resolve(layerService_.update(layer));
      }).error(function(data, status) {
          var error = 'Error configuring layer.';
          if (data.hasOwnProperty('error_message')) {
              error = data.error_message;
          }
          deferredResponse.reject(error, data, status);
        });
      return deferredResponse.promise;
    };

    this.layerFailure = function(layer) {
        return layer.status === 'FAILURE';
      };

    this.layerSuccessful = function(layer) {
      return layer.status === 'SUCCESS';
    };

    this.layerProcessing = function(layer) {
      return layer.status === 'PENDING' || layer.status === 'STARTED';
    };

    this.layerComplete = function(layer) {
      return layerService_.layerSuccessful(layer) || layerService_.layerFailure(layer);
    };

    this.update = function(layer) {
      var deferredResponse = q_.defer();
      httpService_.get(layer.resource_uri).success(function(data, status) {
            deferredResponse.resolve(angular.extend(layer, data));
        });
      return deferredResponse.promise;
    };

  })

  .controller('uploadList', function($scope, UploadedData, $rootScope) {
    $scope.uploads = [];
    $scope.loading = true;
    $scope.currentPage = 0;
    $scope.offset = 0;
    $scope.limit = 10;


    function getUploads(query) {

        if (query == null) {
            query = {offset: $scope.offset, limit: $scope.limit, user__username: $scope.user}
        }

        UploadedData.query(query).$promise.then(function(data) {
            $scope.uploads = data.objects;
            $scope.offset = data.meta.offset;
            $scope.totalItems = data.meta.total_count;
            $scope.loading = false;
        });
    }

    $scope.init = function(user) {
      $scope.user = user;
      getUploads();
    };

    $rootScope.$on('upload:complete', function(event, args) {
        if (args.hasOwnProperty('id')) {
            getUploads();
        }
    });

    $scope.pageChanged = function() {
      $scope.offset = ($scope.currentPage - 1) * $scope.limit;
      var query = {offset: $scope.offset, limit: $scope.limit};
      getUploads(query);
    };

   })
  .controller('ImportController', function ($scope, $uibModal, $log) {

      $scope.errors = [];
      $scope.animationsEnabled = true;

      // TODO: Refactor args into a config object.
      $scope.open = function (layer, templateUrl, modalImage, staticUrl, appendTo, shapefile_link, csv_link) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: templateUrl || 'importWizard.html',
            controller: 'WizardController',
          //size: size,
            resolve: {
                layer: function () {
                    return layer;
                },
                modalImage: function () {
                    return modalImage;
                },
                staticUrl: function () {
                    return staticUrl;
                },
                appendTo: function () {
                    return appendTo;
                },
                shapefile_link: function () {
                    return shapefile_link;
                },
                csv_link: function () {
                    return csv_link;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
      };

  })

  .controller('WizardController', function ($scope, $modalInstance, layer, layerService, $interval, modalImage, staticUrl, appendTo, shapefile_link, csv_link) {
      $scope.appendTo = appendTo;
      $scope.layer = layer;
      $scope.errors = false;
      $scope.errorMessages = [];
      $scope.modalImage = modalImage;
      $scope.staticUrl = staticUrl;
      $scope.shapefile_link = shapefile_link;
      $scope.csv_link = csv_link;
      $scope.layerSet = ($scope.layer != null).toString();
      $scope.defaultPermissions = {'users':{'AnonymousUser':['change_layer_data', 'download_resourcebase', 'view_resourcebase']}};
      var stop;

      $scope.setDefaults = function() {
        if ($scope.layer == null) {
            return
        }
        if ($scope.layer.hasOwnProperty('name') && !($scope.layer.configuration_options.hasOwnProperty('name'))) {
            $scope.layer.configuration_options.name = $scope.layer.name;
        }

        if ($scope.layer.configuration_options.permissions == null) {
            $scope.layer.configuration_options.permissions = $scope.defaultPermissions;
        }

        $scope.layer.configuration_options.editable = true;
      };

      $scope.appending = function(asString) {
          var appending = ($scope.appendTo != null && $scope.appendTo !== false);

          if (asString === true) {
              return appending.toString()
          }

          return appending;

      };

      $scope.setLayer = function(layer) {
        $scope.layer = layer;

        if (($scope.appending()) === true) {
            $scope.layer.configuration_options.appendTo = $scope.appendTo;
        }

        $scope.setDefaults();
      };

      $scope.setDefaults();

      $scope.timeEnabled = function(asString) {
        if ($scope.layer == null) {
            return false;
        }

        if ($scope.layer.configuration_options.configureTime !== true) {
         //Angular wizard 'wz-disabled' disables a wizard screen when it receives 'true' (string) as a value.
         if (asString === true) {
          return 'true';
         }
          return true;
        }
      };

      $scope.ok = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.stopPolling = function() {
          if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
          }
        };

      $scope.importLayer = function () {
        // Stop if we're already polling
        if (angular.isDefined(stop)) {
          return;
        }
        $scope.processing = true;
        layerService.configureUpload($scope.layer).then(function(newLayer) {
          stop = $interval(function() {
              layerService.update(newLayer).then(function(updatedLayer){
                if (layerService.layerComplete(updatedLayer)) {
                    $scope.stopPolling();
                    $scope.processing = false;
                    $scope.errors = layerService.layerFailure(updatedLayer);
                    $scope.success = layerService.layerSuccessful(updatedLayer);
                }
              })
          }, 2000);
          },function(reason) {
          $scope.errors = true;
          $scope.errorMessages.push(reason);
          $scope.processing = false;
        });
      }

    })

    .controller('UploaderController', function ($scope,  FileUploader, $cookies, $rootScope, UploadedData
                                                ) {
      $scope.uploader = new FileUploader({'url': '/uploads/new/json',
          autoUpload: true,
          headers:{'X-CSRFToken': $cookies['csrftoken']}
      });

      $scope.reset = function() {
          $scope.errors = [];
          $scope.uploadSuccessful = false;
          // TODO: Implement this:
          $scope.uploadInProgress = false;
      };

      $scope.reset();

      $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
        $scope.reset();
        if (response.hasOwnProperty('errors')) {
          $scope.uploadSuccessful = false;
          $scope.errors = response.errors;
        } else {
          UploadedData.query({id: response.id}).$promise.then(function(response){
              $scope.setLayer(response['layers'][0]);
          });
          $scope.uploadSuccessful = true;
          $rootScope.$broadcast('upload:complete', response);
        }
      };

      $scope.ok = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    })

  .directive('upload',
      function($http, UploadedData) {
        return {
          restrict: 'E',
          replace: true,
          templateUrl: function(elem,attrs) {
           return attrs.templateUrl || '/static/importer/partials/upload.html'
          },
          scope: {
              upload: '=uploadObject',
              i: '=', //passes the index of the object, used to delete uploads
              staticUrl: '@'
          },
          link: function(scope, element, attrs) {
              scope.showImportOptions = false;
              scope.layers = [];
              scope.canGetFields = true;
              scope.showImportWaiting = false;
              scope.showDetails = false;

              scope.allLayersImported = function() {
                for (var i = 0; i < scope.layers.length; i++) {
                    if (scope.layers[i].geonode_layer === {}){
                        return false
                    }
                }
                return true;
              };

              scope.deleteLayer = function(index) {
                  var id = scope.upload.id;
                  UploadedData.delete({id: id}, function() {
                     console.log(scope.$parent);

                     scope.$parent.uploads.splice(index, 1);

                  });
              };

              scope.getFields = function() {
                  if (scope.canGetFields !== true) {
                      return;
                  }
                  scope.showImportWaiting = true;
                  $http.get('/uploads/fields/' + scope.upload.id, {}).success(function(data, status) {
                      scope.layers = data;
                      scope.showImportWaiting = false;
                      scope.canGetFields = false;

                }).error(function(data, status) {
                   scope.showImportWaiting = false;
                   scope.configuring = false;
                   scope.hasError = true;
                  });
              };

          }
        };
      })

  .directive('layerInUpload',
      function($http) {
        return {
          restrict: 'C',
          replace: false,
          scope: true,
          // The linking function will add behavior to the template
          link: function(scope, element, attrs) {
              scope.configuring = false;
              scope.hasError = false;
              scope.complete = false;
              scope.importOptions = {configureTime: true, editable: true, convert_to_date: []};

              scope.isImported = function() {
                  return scope.status === 'SUCCESS';
              };

              function validateImportOptions(){
                  var desc = scope.layer;
                  var layer = scope.layer;

                  layer.configuration_options = layer.configuration_options || {};

                  if (!layer.hasOwnProperty('index') === true) {
                      layer['index'] = index;
                  }

                  var checkStartDate = layer.configuration_options.hasOwnProperty('start_date') && layer.configuration_options.start_date != "";
                  var checkEndDate = layer.configuration_options.hasOwnProperty('end_date') && layer.configuration_options.end_date != "";
                  var dates = [];
                  layer.configuration_options.convert_to_date = [];

                  if ((checkStartDate === true || checkEndDate == true)
                      && layer.configuration_options.configureTime === true) {
                      for (var i = 0; i < desc.fields.length; i++) {

                          var fieldType = desc.fields[i]['type'];
                            if (fieldType === 'Date' || fieldType === 'DateTime') {
                                dates.push(desc.fields[i]['name']);
                            }
                      }

                      if (checkStartDate === true && dates.indexOf(layer.configuration_options['start_date']) == -1) {
                        layer.configuration_options.convert_to_date.push(layer.configuration_options['start_date']);
                      }

                      if (checkEndDate === true && dates.indexOf(layer.configuration_options['end_date']) == -1) {
                        layer.configuration_options.convert_to_date.push(layer.configuration_options['end_date']);
                      }
                  } else {
                      layer.configuration_options['start_date'] = null;
                      layer.configuration_options['end_date'] = null;
                  }
              }

              scope.isValid = function() {
                  return scope.layer.configuration_options.configureTime === false ||  (scope.layer.configuration_options.configureTime === true
                      && (scope.layer.configuration_options.start_date != null || scope.layer.configuration_options.end_date != null));
              };

              scope.hasFailure = function() {
                return scope.layer.status === 'FAILURE';
              };

              scope.successful = function() {
                return scope.layer.status === 'SUCCESS';
              };

              scope.processing = function() {
                  return scope.layer.status === 'PENDING' || scope.layer.status === 'STARTED';
              };

              scope.complete = function() {
                  return scope.successful() || scope.layer.geonode_layer != null || scope.hasFailure();
              };

              function update(){
                  $http.get(scope.layer.resource_uri).success(function(data, status) {
                        console.log(scope.layer, data);
                        scope.layer = angular.extend(scope.layer, data);

                        if (scope.processing() !== false) {
                            setTimeout(function() {
                                update();
                            }, 2000);
                            console.log(scope.layer.status);
                        }
                    });
              }


              scope.configureUpload = function() {
                  alert('what');
                  scope.configuring = true;
                  validateImportOptions();
                  $http.post(scope.layer.resource_uri + 'configure/', scope.layer.configuration_options).success(function(data, status) {
                    // extend current object with get request to resource_uri
                    console.log('configuration started');
                    update();
                }).error(function(data, status) {
                   scope.configuring = false;
                   scope.hasError = true;
                  });
              }
          }
        };
      });

})();
