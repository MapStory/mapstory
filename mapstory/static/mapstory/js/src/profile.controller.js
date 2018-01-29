/*
 *  Profile Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('profileController', profileController)
    .controller('layersController', layersController)
    .controller('storiesController', storiesController);

  function profileController($injector, $scope, $http) {
    $scope.counts = {};
    $scope.interestChips = interests;

    $scope.query = {
      owner__username__in: PROFILE_USERNAME,
      limit: CLIENT_RESULTS_LIMIT,
      offset: 0
    };

    //if not the owner, don't retrieve unpublished resources
    // needs better permissions management for superusers/admin
    if (USER != PROFILE_USERNAME && USER != 'admin'){
      $scope.query.is_published = true;
    }
  
    //Get data from apis and make them available to the page
    function getResourceCounts() {
      return $http.get(SEARCH_URL, {params: $scope.query || {}})
      .then(
        /* success */
        function(response) {
          var facets = response.data.meta.facets;
          var layerCount, storyCount;

          // if type facets are present, store them
          if (facets.type){
            layerCount = facets.type.layer;
            storyCount = facets.type.mapstory;
          }

          // assign type facet counts or a default of 0 
          // displays as a total on the profile tabs
          $scope.counts.layers = layerCount || 0;
          $scope.counts.maps = storyCount || 0;
        },
        /* failure */
        function(error) {
          console.log("The request failed: ", error);
        }
      )
    };

    getResourceCounts();
  };

  function layersController($injector, $scope, $http, page) { 
    var vm = this;

    vm.search = function() {
      // use profile query, but also only get layers
      var query = _.extend({type__in: 'layer'}, $scope.query);

      return $http.get(SEARCH_URL, {params: query || {}})
      .then(
        /* success */
        function(response) {
          vm.cards = response.data.objects;
          page.paginate(response, vm, $scope);
        },
        /* failure */
        function(error) {
          console.log("The request failed: ", error);
        }
      )
    };

    vm.pageDown = page.down(vm, $scope);
    vm.pageUp = page.up(vm, $scope);

    vm.search()
  };

  function storiesController($injector, $scope, $http, page) {  
    var vm = this;
    
    //Get data from apis and make them available to the page
    vm.search = function() {
      // use profile query, but also only get mapstories
      var query = _.extend({type__in: 'mapstory'}, $scope.query);

      return $http.get(SEARCH_URL, {params: query || {}})
      .then(
        /* success */
        function(response) {
          vm.cards = response.data.objects;
          page.paginate(response, vm, $scope);
        },
        /* failure */
        function(error) {
          console.log("The request failed: ", error);
        }
      )
    };

    vm.pageDown = page.down(vm, $scope);
    vm.pageUp = page.up(vm, $scope);

    vm.search()
  };
})();