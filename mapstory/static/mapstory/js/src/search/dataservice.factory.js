 /*
  */
(function() {
'use strict';

  angular
    .module('mapstory.search')
    .factory('dataService', dataService);

  dataService.$inject = ['$http'];

  function dataService($http) {
    return {
      getKeywords: getKeywords,
      getOwners: getOwners,
      getInterests: getInterests,
      getRegions: getRegions,
      _modify: regionsForAutocomplete
    };

    ////////////////////////
    function getInterests(query) {
      return $http.get(INTERESTS_ENDPOINT,  {params: query || {}})
           .then(function(response){
              return response.data.objects;
          });
    }

    function getKeywords(query) {
      return $http.get(KEYWORDS_ENDPOINT,  {params: query || {}})
           .then(function(response){
              return response.data.objects;
          });
    }

    function getOwners(query){
      return $http.get('/api/owners/', {params: query || {}})
          .then(function(response){
              return response.data.objects;
          });
    }

    /// regions needs to be updated to async

    function getRegions(){
      return $http.get(REGIONS_ENDPOINT)
              .then(regionsForAutocomplete);
    }

    function regionsForAutocomplete(response) {
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
  };
})();