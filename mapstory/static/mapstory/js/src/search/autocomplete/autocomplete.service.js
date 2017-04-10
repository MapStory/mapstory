/*
* MapStory Search Autocomplete Service
* builds functions for autocompletion on each explore field
* for use with angular material chips
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('autocompleteService', autocompleteService);

  function autocompleteService($http, $location, $q) {

    var countries = new Autocompletes('country');
    var authors = new Autocompletes('owner__username__in');
    var cities = new Autocompletes('city', 'city');
    var interests = new Autocompletes('interest_list', 'slug');
    var tags = new Autocompletes('keywords__slug__in', 'slug');

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

    function newChip(key, chip) {  
      if (chip[key]){
        return chip
      }else{
        var newChip = {};
        newChip[key] = chip;
        return newChip
      }
    }

    function querySearch(query) {
      var list = this.list;
      var results = query ? list.filter(createFilter(query)) : [];
      return results;
    }

    function createFilter(query) {
      var lowercaseQuery = query.toLowerCase();    
      return function filterFn(entry) {
        return _.some(entry._lower, function(i){
            return i.indexOf(lowercaseQuery) > -1
        });
      };
    }

    function tidyQuery(filter, query) {
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function Autocompletes(filter, newChipKey) {
      this.querySearch = querySearch;
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
      
      if(newChipKey){
        this.newChip = _.partial(newChip, newChipKey);
      }    
    }
  }
})();