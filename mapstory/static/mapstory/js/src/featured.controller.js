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
          // if there are at least 4 items featured, assign them to cards, 
          // if not use the static json 'defaultCards' below 
          // this will be helpful on dev or demo environs where there may not be featured content yet
          // we should transition it out tho
            if (response.data.objects.length >= 4) {
              vm.cards = response.data.objects;
            } else {
              vm.cards = defaultCards;
            }
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
          }
        )
    }
    getFeatured();

    // momentarily storing a json of an api response here of just the fields needed to generate cards 
    // will likely break / need to updated or just removed w/ data migration in Aug-Sept 2017
    var defaultCards = [
      {category__gn_description: "Nature & Environment", date: "2016-09-28T14:44:30", detail_url: "/story/21510", owner__first_name: "Holly", owner__last_name: "Winscott", owner__username: "hwinscot", popular_count: 295, thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21510.jpg", title: "Fracking Sites in West Virgina",},
      {category__gn_description: "Geopolitics", date: "2016-09-28T14:52:41", detail_url: "/story/21977", owner__first_name: "Jeff", owner__last_name: "Meyer", owner__username: "jeffmeyer", popular_count: 105, thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21977.jpg", title: "United States Civil War",},
      {category__gn_description: null, date: "2014-07-09T18:01:25", detail_url: "/layers/geonode:NorthCarolinaFinal", owner__first_name: "Jonathan", owner__last_name: "Davis", owner__username: "jdavis15", popular_count: 106, thumbnail_url: "https://mapstory.org/uploaded/thumbs/layer-f3bcaa78-07bc-11e4-985a-12313922479d-thumb.png", title: "Evolution of Congressional Districts in North Carolina 1789-2012",},
      {category__gn_description: "Nature & Environment", date: "2016-09-28T14:35:37", detail_url: "/story/21037", owner__first_name: "Kathryn", owner__last_name: "Pole", owner__username: "kpole", popular_count: 114, thumbnail_url: "https://mapstory.org/uploaded/thumbs/map21037.jpg", title: "Karenis Brevis in Florida",},
      {category__gn_description: "Crisis", date: "2016-09-28T14:32:30", detail_url: "/story/20868", owner__first_name: "Everett", owner__last_name: "Lasher", owner__username: "everett", popular_count: 186, thumbnail_url: "https://mapstory.org/uploaded/thumbs/map20868.jpg", title: "Village Destruction in the Darfur Region",},
      {category__gn_description: "Nature & Environment", date: "2016-09-28T14:32:46", detail_url: "/story/20881", owner__first_name: "Shobana", owner__last_name: "Atmaraman", owner__username: "satmaraman", popular_count: 24, thumbnail_url: "https://mapstory.org/uploaded/thumbs/map20881.jpg", title: "Earthquake and Volcano Fatalities: a sample",}
    ];
  };
})();