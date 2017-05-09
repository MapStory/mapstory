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

    function ChipField(filter, newChipKey) {
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
      this.transform = _.partial(transform, newChipKey);
      
      if(newChipKey){
        this.newChip = _.partial(newChip, newChipKey);
      }
    }

    return ChipField;

    ///////////////

    function newChip(key, chip) {  
      if (chip[key]){
        return chip
      }else{
        var newChip = {};
        newChip[key] = chip;
        return newChip
      }
    }

    function tidyQuery(filter, query) {
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function transform(chipKey, currentQuery){     
      return _.map(currentQuery, function (item) {
        var chip = {};
        chip[chipKey] = item;
        return chip;
      }) || [];
    }
  }
})();