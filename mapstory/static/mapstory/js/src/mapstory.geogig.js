

(function() {
  const module = angular.module("geogig", []);

  module.service("geoGigService", ($http) => ({
      geogigCommand(url) {
        if (url) {
          const req = $http({
            url,
            method: "GET",
          });
          return req;
        }
      }
    }));

  /*
  * Main search controller
  * Load data from api and defines the multiple and single choice handlers
  * Syncs the browser url with the selections
  */
  module.controller('geogigController', ($scope, geogigConfig, geoGigService) => {
    const errorText = 'There was an error receiving the latest GeoGig stats.';
    $scope.geoserverURL = geogigConfig.geoserverURL;
    $scope.workspace = geogigConfig.workspace;
    $scope.typename = geogigConfig.typename;
    $scope.store = geogigConfig.store;
    $scope.statisticsURL = geogigConfig.statisticsURL;
    $scope.logURL = geogigConfig.logURL;
    $scope.repoURL = geogigConfig.repoURL;

    if ($scope.statisticsURL) {
      geoGigService.geogigCommand($scope.statisticsURL).then(
        (data) => {
          if (data) {
            $scope.stats = data.data.response.Statistics;
            $('#geogig-message').hide();
            $('#geogig-stats').show();
          }
        },
        (error) => {
          $scope.error = error;
          $('#geogig-message > h4').text(errorText);
        });
    }

    if ($scope.logURL) {
      geoGigService.geogigCommand($scope.logURL).then(
        (data) => {
          if (data.data.response) {
            $('#geogig-message').hide();
            $('#geogig-stats').show();
            const response = data.data.response.commit;
            if (!Array.isArray(response)) {
              $scope.commits = [response];
            } else {
              $scope.commits = response;
            }
            for (let i = 0; i < $scope.commits.length; i++) {
              const commit = $scope.commits[i];
              if (commit.author) {
                commit.commitTimeSince = moment(commit.author.timestamp).calendar();
              }
            }
          }
        },
        (error) => {
          $scope.error = error;
          $('#geogig-message > h4').text(errorText);
        });
    }
  });
})();
