/*
* Country Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('countriesController', countriesController);

  function countriesController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.country = autocompleteService.countries;
    
    var countriesByCodes;

    function syncDisplay(){
      if( $scope.autocomplete.countries ){
        countriesByCodes = $scope.autocomplete.countries.byCodes;
        
        vm.country.list = $scope.autocomplete.countries.all; 
        vm.countryChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.country.tidy;
      return _.map(tidy($scope.query), function (item) {
        return countriesByCodes[item]
      }) || [];
    }

    $scope.$on('loadedCountries', function(){ syncDisplay(); });
    $scope.$on('topEvent', function(){ syncDisplay(); });
  }
})();