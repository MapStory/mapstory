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
      $http.get(endpoint, {params: params}).success(function(data){
        //sets an active property if category already selected in a url query
        
        $rootScope[api]= data.objects;
      });
    }
    
    load_active_list($http, $rootScope, $location, 'categories',
          CATEGORIES_ENDPOINT,'category__identifier__in');
  })

  .filter('activated', function (){
    return function(value, property, query){

      //console.log(query);
      if(_.has(query,property)){
        return _.contains(query[property], value) || query[property] == value;
      }else{
        return false;
      }
    }
  })
    // add filter to decode uri
  .filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  })

})();