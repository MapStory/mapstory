/*
* MapStory Search Autocomplete Service
* builds functions for autocompletion on each explore field
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('autocomplete', autocomplete);

  function autocomplete($http, $location, $q) {

    var countries = new Autocompletes('country');
    var authors = new Autocompletes('owner__username__in');
    var cities = new Autocompletes('city');
    var interests = new Autocompletes('interest_list');
    var tags = new Autocompletes('keywords__slug__in');

    var service = {
      authors: authors,
      cities: cities,
      countries: countries, 
      interests: interests,
      tags: tags,
      _tidyQuery: tidyQuery,
    };

    return service;

    ////////////

    function querySearch(query) {
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

    function tidyQuery(filter, query) {
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function Autocompletes(filter){
      this.querySearch = querySearch;
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
    }
  }
})();