'use strict';

(function(){

  var module = angular.module('profile_search', [], function($locationProvider) {
      if (window.navigator.userAgent.indexOf("MSIE") == -1){
          $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          });

          // make sure that angular doesn't intercept the page links
          angular.element("a").prop("target", "_self");
      }
    });

  /*
  * Main search controller
  * Load data from api and defines the multiple and single choice handlers
  * Syncs the browser url with the selections
  */
  module.controller('profile_search_controller', function($injector, $scope, $location, $http, Configs){
    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);

    $scope.search = function() {
      $scope.query.limit = 100;
      $scope.query.offset = 0;
      return query_api($scope.query).then(function(result) {
        return result;
      });
    };

    // Here we want to grab the number of layers and number of maps
    // query={q: query.q}; query.type__in='map'; search();
    $scope.calculate_maps_layers = function() {
      $scope.query.type__in = 'layer';
      $scope.query.owner__username__in = Configs.url.split("?owner__username__in=").pop();
      $scope.search().then(function(result) {
        $scope.total_layers = $scope.total_counts;
        $scope.query.type__in = 'map';
        $scope.search().then(function(result) {
          $scope.total_maps = $scope.total_counts;
          //$scope.query.type__in = null;
          //$scope.query.owner__username__in = null;
        });
      });
    };

    $scope.calculate_maps_layers();

    $scope.showUserGroup = function() {
        if ($location.search().hasOwnProperty('type__in')) {
            var typeInParam = $location.search()['type__in'];
            if (typeof(typeInParam) === "string") {
                if (typeInParam === 'user' || typeInParam === 'group') {
                    return true;
                }
            } else if (typeof(typeInParam) === "object") {
                for(var i = 0; i < typeInParam.length; i++) {
                  if(typeInParam[i] === 'user' || typeInParam[i] === 'group') {
                      return true;
                    }
                };
            }
          }

        return false;
    };

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}}).success(function(data){
        $scope.results = data.objects;
        $scope.total_counts = data.meta.total_count;
        $scope.$root.query_data = data;
        if (HAYSTACK_SEARCH) {
          if ($location.search().hasOwnProperty('q')){
            $scope.text_query = $location.search()['q'].replace(/\W+/g," ");
          }
          if ($location.search().hasOwnProperty('type__in')){
            $scope.type__in = $location.search()['type__in'].replace(/\W+/g," ");;
          }
        } else {
          if ($location.search().hasOwnProperty('title__icontains')){
            $scope.text_query = $location.search()['title__icontains'].replace(/\W+/g," ");
          }
        }

        //Update facet/keyword/category counts from search results
        if (HAYSTACK_FACET_COUNTS){
            module.haystack_facets($http, $scope.$root, $location);
            $("#types").find("a").each(function(){
                if ($(this)[0].id in data.meta.facets.subtype) {
                    $(this).find("span").text(data.meta.facets.subtype[$(this)[0].id]);
                }
                else if ($(this)[0].id in data.meta.facets.type) {
                    $(this).find("span").text(data.meta.facets.type[$(this)[0].id]);
                } else {
                    $(this).find("span").text("0");
                }
            });
        }
      });
    };
  });

  // add filter to decode uri
  module.filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  });
  
})();