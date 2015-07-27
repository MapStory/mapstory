'use strict';

(function(){

    var module = angular.module('paginate', [], function($locationProvider) {
        if (window.navigator.userAgent.indexOf("MSIE") == -1){
            $locationProvider.html5Mode({
              enabled: true,
              requireBase: false
            });

            // make sure that angular doesn't intercept the page links
            angular.element("a").prop("target", "_self");
        }
      });

    module.controller('paginate_controller', function($injector, $scope, $location, $http, Configs){
    /*
    * Pagination 
    */
    // Control what happens when the total results change
    $scope.$watch('total_counts', function(){
      $scope.numpages = Math.round(
        ($scope.total_counts / $scope.query.limit) + 0.49
      );

      // In case the user is viewing a page > 1 and a 
      // subsequent query returns less pages, then 
      // reset the page to one and search again.
      if($scope.numpages < $scope.page){
        $scope.page = 1;
        $scope.query.offset = 0;
        query_api($scope.query);
      }

      // In case of no results, the number of pages is one.
      if($scope.numpages == 0){$scope.numpages = 1};
    });

    $scope.paginate_down = function(){
      if($scope.page > 1){
        $scope.page -= 1;
        $scope.query.offset =  $scope.query.limit * ($scope.page - 1);
        query_api($scope.query);
      }   
    }

    $scope.paginate_up = function(){
      if($scope.numpages > $scope.page){
        $scope.page += 1;
        $scope.query.offset = $scope.query.limit * ($scope.page - 1);
        query_api($scope.query);
      }
    }
    /*
    * End pagination
    */
  });
})();