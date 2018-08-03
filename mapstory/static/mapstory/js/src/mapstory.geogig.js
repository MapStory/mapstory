'use strict';

(function() {
  var module = angular.module("geogig", []);

  module.service("geoGigService", function($http) {
    return {
      geogigCommand: function(url) {
        if (url) {
          var req = $http({
            url: url,
            method: "GET",
          });
          return req;
        }
      }
    };
  });

  /*
  * Main search controller
  * Load data from api and defines the multiple and single choice handlers
  * Syncs the browser url with the selections
  */
  module.controller('geogigController', function($scope, geogigConfig, geoGigService) {
    var errorText = 'There was an error receiving the latest GeoGig stats.';
    $scope.geoserverURL = geogigConfig.geoserverURL;
    $scope.workspace = geogigConfig.workspace;
    $scope.typename = geogigConfig.typename;
    $scope.store = geogigConfig.store;
    $scope.statisticsURL = geogigConfig.statisticsURL;
    $scope.logURL = geogigConfig.logURL;
    $scope.repoURL = geogigConfig.repoURL;

    if ($scope.statisticsURL) {
      geoGigService.geogigCommand($scope.statisticsURL).then(
        function(data) {
          if (data) {
            $scope.stats = data.data.response.Statistics;
            $('#geogig-message').hide();
            $('#geogig-stats').show();
          }
        },
        function(error) {
          $scope.error = error;
          $('#geogig-message > h4').text(errorText);
        });
    }

    if ($scope.logURL) {
      geoGigService.geogigCommand($scope.logURL).then(
        function(data) {
          if (data.data.response) {
            $('#geogig-message').hide();
            $('#geogig-stats').show();
            var response = data.data.response.commit;
            if (!Array.isArray(response)) {
              $scope.commits = [response];
            } else {
              $scope.commits = response;
            }
            for (var i = 0; i < $scope.commits.length; i++) {
              var commit = $scope.commits[i];
              if (commit.author) {
                commit.commitTimeSince = moment(commit.author.timestamp).calendar();
              }
            }
          }
        },
        function(error) {
          $scope.error = error;
          $('#geogig-message > h4').text(errorText);
        });
    }
  });
})();
