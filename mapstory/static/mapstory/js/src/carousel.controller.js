/*
 *  Homepage Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('carouselController', carouselController);

  function carouselController($injector, $scope, $location, $http){
    $scope.query = {
      'is_published': true,
      'featured': true,
      'limit': 80,
      'offset': 0
    };

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}}).success(function(data){
        $scope.results = $scope.display = data.objects;
      });
    };

    $scope.reset = function(){
      $scope.display = $scope.results;
    }

    $scope.filterCategory = function(categoryFilter) {
      //does not require 'type' like in main geonode search controller
      $scope.display = _.where($scope.results,{category: categoryFilter} )
    };

    query_api($scope.query);
  }
})();
