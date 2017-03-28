 /*
  * Data Service Factory
  */
(function() {
'use strict';

  angular
    .module('mapstory.search')
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http'];
  
  function dataservice($http, logger) {
    return {
        getKeywords: getKeywords,
        getRegions: getRegions,
        getOwners: getOwners
      }

    function getKeywords() {
        return $http.get('/api/keywords/')
            .then(getKeywordsComplete);

        function getKeywordsComplete(response) {
          var index = {};
          var list = _.map(response.data.objects, function (tag) {
            tag._lower = [tag.slug.toLowerCase()];
            index[tag.slug] = tag;
            return tag;
          });

          list = _.sortBy(list, function(tag) {
            return -tag.count;
          });

          var trending = [];

          var displayLength = (list.length > 10) ? 10 : list.length;

          for (var i = 0; i < displayLength; i++) {
            if(list[i]['count'] != 0)
              trending.push(list[i]['slug']);
          } 

          return {
            list: list,
            index: index,
            trending: trending
          } 
        }
    }

    function getRegions(){
    return $http.get('/api/regions/')
            .then(getRegionsComplete);
    
      function getRegionsComplete(response) {
        var index = {};
        var list = _.map(response.data.objects, function (region) {
            region._lower = [ region.name.toLowerCase() , region.code.toLowerCase() ];
            index[region.code] = region;
          return region;
        });

        return {
          list: list,
          index: index,
        } 
      }
    }

    function getOwners(){
      return $http.get('/api/owners/')
              .then(getOwnersComplete);
      
        function getOwnersComplete(response) {
          var profiles = { list: [], index:{} };
          var cities = { list: [] };
          
          _.reduce(response.data.objects, function ( profile, user) {
            user._lower = [ user.first_name.toLowerCase(), user.last_name.toLowerCase(), user.username.toLowerCase() ];
            profiles.list.push(user);
            profiles.index[user.username] = user;

            if(user.city){
              var city = { city: user.city};
              city._lower = [ user.city.toLowerCase() ];
              cities.list.push(city);
            }
            
            return profile;
          });

          return {
            profiles: profiles,
            cities: cities
          } 
        }
    }
  };
})();