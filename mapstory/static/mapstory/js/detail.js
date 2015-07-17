'use strict';

// Note that most of this section is copied from search.js in geonode; it might be better to extract the logic into a
// new service rather than recreate a nearly identical controller
(function() {
    var module = angular.module('related', [], function($locationProvider) {
      if (window.navigator.userAgent.indexOf("MSIE") == -1){
          $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          });

          // make sure that angular doesn't intercept the page links
          angular.element("a").prop("target", "_self");
      }
    });

    module.controller('search_controller', function($injector, $scope, $location, $http){
        $scope.query = $location.search();
        $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
        $scope.query.offset = $scope.query.offset || 0;
        $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);


        //Get data from apis and make them available to the page
        function query_api(data){
          return $http.get('/api/featured/', {params: data || {}}).success(function(data){
            $scope.results = data.objects;
            $scope.total_counts = data.meta.total_count;
            $scope.$root.query_data = data;
            if (HAYSTACK_SEARCH) {
              if ($location.search().hasOwnProperty('q')){
                $scope.text_query = $location.search()['q'].replace(/\+/g," ");
              }
            } else {
              if ($location.search().hasOwnProperty('title__icontains')){
                $scope.text_query = $location.search()['title__icontains'].replace(/\+/g," ");
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

            // Initialize carousel display
            $scope.display = [];
            $scope.indeces = [];
            for (var i = 0; i < $scope.results.length; i++) {
                $scope.display[i] = $scope.results[i];
                $scope.indeces[i] = i;
                if (i >= 3) {
                    break;
                }
            }
          });
        };
        query_api($scope.query);

        // Adds a query for this category
        $scope.query_category = function(filter, type) {
            if (filter) {
                $scope.query['category__identifier__in'] = filter;
            } else {
                $scope.query['category__identifier__in'] = null;
            }
            if (type) {
                $scope.query['type__in'] = type;
            } else {
                $scope.query['type__in'] = null;
            }
            query_api($scope.query);
        }
    });
})();