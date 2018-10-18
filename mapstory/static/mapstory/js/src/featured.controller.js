/*
 *  HomePage Featured Controller
 */
(function() {
  

  angular
    .module('mapstory')
    .controller('featuredController', featuredController);

  function featuredController($injector, $scope, $http) {
    const vm = this;

    const query = {
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
          (response) => {
            vm.cards = response.data.objects;
          },
          /* failure */
          (error) => {
            console.log("The request failed: ", error);
          }
        )
    }
    getFeatured();
  };
})();
