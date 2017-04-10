/**
 * Search Module
 */

(function() {
	'use strict';

	angular.module('mapstory.search', ['ngMaterial'], function($locationProvider) {
    if (window.navigator.userAgent.indexOf("MSIE") == -1){
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      // make sure that angular doesn't intercept the page links
      angular.element("a").prop("target", "_self");
    }
  })
	    
	.constant('Configs', {
	  url: SEARCH_URL
	})

  .run(function($http, $rootScope, $location){

    function load_active_list ($http, $rootScope, $location, api, endpoint, filter){
      var params = typeof FILTER_TYPE == 'undefined' ? {} : {'type': FILTER_TYPE};
      $http.get(endpoint, {params: params})
        .then(
          /* success */
          function(response) {
           $rootScope[api] = response.data.objects
           //used for homepage carousel and explore/content_sidebar
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
          }
        )
    }
    
    load_active_list($http, $rootScope, $location, 'categories',
          CATEGORIES_ENDPOINT,'category__identifier__in');
  })

    // add filter to decode uri
  .filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  })

})();