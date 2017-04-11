/*
* Cities Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('citiesController', citiesController);
  
  function citiesController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.cities = autocompleteService.cities;

    function syncDisplay(){
      if( $scope.autocomplete.cities ){  
        vm.cities.list = $scope.autocomplete.cities.all; 
        vm.cityChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.cities.tidy;
      return _.map(tidy($scope.query), function (item) {
        return {'city': item};
      }) || [];
    } 
        
    $scope.$on('loadedOwners', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();