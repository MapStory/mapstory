/**
 * Search Module
 */

(function() {
	

	angular.module('mapstory.search', ['ngMaterial', 'mapstory'], ($locationProvider) => {
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

  .run(($http, $rootScope, $location) => {    
    const params = typeof FILTER_TYPE === 'undefined' ? {} : {'type': FILTER_TYPE};
    
    function getCategories(){
      $http.get(CATEGORIES_ENDPOINT, {params})
      .then(
        /* success */
        (response) => {
         $rootScope.categories = response.data.objects
         // populates homepage carousel categories and explore sidebar categories
        },
        /* failure */
        (error) => {
          console.log("The request failed: ", error);
        }
      )
    }

    getCategories();
  })

    // add filter to decode uri
  .filter('decodeURIComponent', () => window.decodeURIComponent)

})();