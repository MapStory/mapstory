/**
 * MapStory Module
 */

(function() {
	'use strict';

	angular.module('mapstory', [
    //osgeo-importer
    'osgeoImporter.uploader',
    'ui.bootstrap',
    //maspstory
    'mapstory.search'
  ], function($locationProvider) {
    if (window.navigator.userAgent.indexOf("MSIE") == -1){
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      // make sure that angular doesn't intercept the page links
      angular.element("a").prop("target", "_self");
      // hack to catch new tabs
      angular.element(document.getElementsByClassName("new-tab")).prop("target", "_blank");
    }
  })

	.config(function($httpProvider, $sceDelegateProvider) {
    // this makes request.is_ajax() == True in Django
    $httpProvider.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';

    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://mapstory-static.s3.amazonaws.com/**',
    'https://mapstory-static.s3.amazonaws.com/**',
    'http://mapstory-demo-static.s3.amazonaws.com/**',
    'https://mapstory-demo-static.s3.amazonaws.com/**']);
    })

	.constant('Configs', {
	  url: SEARCH_URL
	})

	// add filter to decode uri
	.filter('decodeURIComponent', function() {
		return window.decodeURIComponent;
	});

	angular.element(document).ready(function() {
    angular.bootstrap(document, ['mapstory']);
  });
})();