'use strict';

// Note that most of this section is copied from search.js in geonode; it might be better to extract the logic into a
// new service rather than recreate a nearly identical controller
(function() {
    var module = angular.module('homepage', [], function($locationProvider) {
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
          });
        };
        query_api($scope.query);

        // Adds a query for this category
        $scope.query_category = function(filter) {
            if (filter) {
                $scope.query['category__identifier__in'] = filter;
            } else {
                $scope.query['category__identifier__in'] = null;
            }
            query_api($scope.query);
        }
    });
})();

$(function() {
    var isMobile = Modernizr.mq('only all and (max-width: 1024px)');

    if (!isMobile) {
        $(window).stellar({
            horizontalScrolling: false,
            responsive: true,/*,
             scrollProperty: 'scroll',
             parallaxElements: false,
             horizontalScrolling: false,
             horizontalOffset: 0,
             verticalOffset: 0*/
        });
    }

    var $container = $('.isotopeWrapper');
    var $resize = $('.isotopeWrapper').attr('id');
    // initialize isotope

    $container.isotope({
        itemSelector: '.isotopeItem',
        resizable: false, // disable normal resizing
        masonry: {
            columnWidth: $container.width() / $resize
        }
    });
    var rightHeight = $('#works').height();
    $('#filter a').click(function() {

        $('#works').height(rightHeight);
        $('#filter a').removeClass('current');

        $(this).addClass('current');
        var selector = $(this).attr('data-filter');
        $container.isotope({
            filter: selector,
            animationOptions: {
                duration: 1000,
                easing: 'easeOutQuart',
                queue: false
            }
        });
        return false;
    });
});