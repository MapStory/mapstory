/*
 */
(function() {
  angular.module("mapstory.search").factory("dataService", dataService);

  dataService.$inject = ["$http"];

  function dataService($http) {
    return {
      getSearchData,
      getKeywords,
      getOwners,
      getInterests,
      getRegions,
      _modify: regionsForAutocomplete
    };

    // //////////////////////
    function getInterests(query) {
      return $http
        .get(INTERESTS_ENDPOINT, { params: query || {} })
        .then(response => response.data.objects);
    }

    function getKeywords(query) {
      return $http
        .get(KEYWORDS_ENDPOINT, { params: query || {} })
        .then(response => response.data.objects);
    }

    function getSearchData(query) {
      return $http
        .get("/api/base/search", { params: query || {} })
        .then(response => response.data.objects);
    }

    function getOwners(query) {
      return $http
        .get("/api/owners/", { params: query || {} })
        .then(response => response.data.objects);
    }

    // / regions needs to be updated to async

    function getRegions() {
      return $http
        .get(`${REGIONS_ENDPOINT}?limit=500`)
        .then(regionsForAutocomplete);
    }

    function regionsForAutocomplete(response) {
      const results = response.data.objects;
      const codes = {};

      const countryResults = _.map(results, region => {
        region._lower = [region.name.toLowerCase(), region.code.toLowerCase()];
        codes[region.code] = region;
        return region;
      });

      return {
        all: countryResults,
        byCodes: codes
      };
    }
  }
})();
