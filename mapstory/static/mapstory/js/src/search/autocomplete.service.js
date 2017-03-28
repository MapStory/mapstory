/*
* 
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('autocomplete', autocomplete);

  function autocomplete($http, $location, $q) {

    var countries = new Autocompletes('countries', 'api/regions', 'country');
    var authors = new Autocompletes('storyteller', 'api/owners', 'owner__username__in');
    var cities = new Autocompletes('cities', 'api/owners', 'city');
    var interests = new Autocompletes('interests', 'api/keywords', 'interest_list');
    var tags = new Autocompletes('tags', 'api/keywords', 'keywords__slug__in');

    var service = {
      authors: authors,
      cities: cities,
      countries: countries, 
      interests: interests,
      tags: tags,
    };

    return service;

    ////////////

    function querySearch(query){
      var list = this.list;
      var results = query ? list.filter(createFilter(query)) : [];
            return results;
    }

    function createFilter(query) {
      var lowercaseQuery = angular.lowercase(query);    
      return function filterFn(entry) {
        return _.some(entry._lower, function(i){
            return i.indexOf(lowercaseQuery) > -1
        });
      };
    }

    function tidyQuery(filter, query){
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function Autocompletes(type, api, filter){
      this.type = type;
      this.api = api;
      this.querySearch = querySearch;
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
    }
  }
})();