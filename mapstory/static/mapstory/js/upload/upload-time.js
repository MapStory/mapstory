
'use strict';

(function() {
  angular.module('mapstory.upload', [])

  .config(function($interpolateProvider, $httpProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  })


  .controller('mapstory.upload.time', function($scope, $http, $window) {
          $scope.time = {type: 'notime', 'presentation_strategy': 'LIST'};
          $scope.time_attributes = $window.time_attributes;
          $scope.year_attributes = $window.year_attributes;
          $scope.text_attributes = $window.text_attributes;
          $scope.submitInProgress = false;
          $scope.errors = [];

          function reset() {
              $scope.time = {type: $scope.time['type'],
                  'presentation_strategy':$scope.time['presentation_strategy']};
          }

          $scope.$watch('time.type', function() {
              reset();
          });

          function makeRequest(data) {

              $http.get(data.redirect_to).
                success(function(data, status, headers, config) {
                    if (data.status === "pending") {
                        setTimeout(function() {
                            makeRequest(data);
                        }, 1000);
                        return;
                    }
                    window.location = data.url;
                    }).
                error(function(data, status, headers, config) {
                    $scope.submitInProgress = false;
                    if (data.errors != null) {
                        $scope.errors = data.errors;
                    }
              });
          }

          function cleanData(data) {
              var cleaned = angular.copy(data, {});
              if (cleaned.attributeType === 'timeAttribute') {
                  delete cleaned.text_attribute;
                  delete cleaned.number_attribute;
              } else if (cleaned.attributeType === 'textAttribute') {
                  delete cleaned.time_attribute;
                  delete cleaned.number_attribute;
              } else if (cleaned.attributeType === 'numberAttribute') {
                  delete cleaned.time_attribute;
                  delete cleaned.text_attribute;
              }
              return cleaned;
          };

          $scope.submit = function() {
            $scope.submitInProgress = true;
            $http.post($window.location.href, cleanData($scope.time)).
              success(function(data, status, headers, config) {
                if('redirect_to' in data) {
                 makeRequest(data);
                } else if ('url' in data) {
                    $scope.submitInProgress = false;
                    window.location = data.url;
                }
              }).
              error(function(data, status, headers, config) {
                $scope.submitInProgress = false;
                if (data.errors != null) {
                    $scope.errors = data.errors;
                }

              });
          }

      });


})();
