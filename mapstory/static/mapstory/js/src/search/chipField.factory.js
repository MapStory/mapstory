/*
* MapStory Search - Chip Field Factory
* builds functions for autocompletion on each explore field
* for use with angular material chips
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('chipFieldFactory', chipFieldFactory);

  function chipFieldFactory() {

    function ChipField(filter, chipProperty) {
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
      this.transform = _.partial(transform, chipProperty);
      
      if(chipProperty){
        this.newChip = _.partial(newChip, chipProperty);
      }
    }

    return ChipField;

    ///////////////

    // query string or array is returned as an array for chip generation
    function tidyQuery(filter, query) {
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    //returns an object with chip information under a given property name
    function newChip(key, chip) {  
      if (chip[key]){
        return chip
      }else{
        var newChip = {};
        newChip[key] = chip;
        return newChip
      }
    }

    //parses query from url into chips for angular material chip directive
    function transform(chipKey, currentQuery){     
      return _.map(currentQuery, function (item) {
         return newChip(chipKey, item);
      }) || [];
    }
  }
})();