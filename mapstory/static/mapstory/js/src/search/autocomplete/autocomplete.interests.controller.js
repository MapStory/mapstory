/*
* Interests Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('interestsController', interestsController);

  function interestsController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.interests = autocompleteService.interests;

    function syncDisplay(){
      if( $scope.lists.keywords){  
        vm.interests.list = $scope.lists.keywords.list; 
        vm.interestChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.interests.tidy;
      return _.map(tidy($scope.query), function (item) {
        return {'slug': item};
      }) || [];
    } 
        
    $scope.$on('loaded', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();