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
        var results = response.data.objects;
        var codes = {};

        var countryResults = _.map(results, function (region) {
            region._lower = [ region.name.toLowerCase() , region.code.toLowerCase() ];
            codes[region.code] = region;
          return region;
        });

        return {
          all: countryResults,
          byCodes: codes,
        } 
      }
    }

    function getOwners(){
      return $http.get('/api/owners/')
              .then(getOwnersComplete);
      
        function getOwnersComplete(response) {
          var profiles = { all: [], byUsername:{} };
          var cities = { all: [] };
          
          _.reduce(response.data.objects, function ( profiles, user) {
            user._lower = [ user.first_name.toLowerCase(), user.last_name.toLowerCase(), user.username.toLowerCase() ];
            profiles.all.push(user);
            profiles.byUsername[user.username] = user;

            if(user.city){
              var city = { city: user.city};
              city._lower = [ user.city.toLowerCase() ];
              cities.all.push(city);
            }
            
            return profiles;
          }, profiles);

          return {
            profiles: profiles,
            cities: cities
          } 
        }
    }
  };
})();