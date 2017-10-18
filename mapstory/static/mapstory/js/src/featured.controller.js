/*
 *  HomePage Featured Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('featuredController', featuredController);

  function featuredController($injector, $scope, $http) {
    var vm = this;

    var query = {
      // set whatever featured count the client would like on the homepage here
      limit: 6,
      offset: 0,
      is_published: true,
      featured: true,
      order_by: "-popular_count"
      // will get both layers and mapstories
      // note to self: check on map types, they should be excluded
    };

    function getFeatured(){
      return $http.get(SEARCH_URL, {params: query || {}})
        .then(
          /* success */
          function(response) { 
            vm.cards = response.data.objects;
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
          }
        )
    }
    getFeatured();
  };
})();