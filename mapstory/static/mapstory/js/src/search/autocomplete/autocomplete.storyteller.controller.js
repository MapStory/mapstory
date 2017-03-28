/*
* StoryTeller Autocomplete Controller
*/
(function() {
'use strict';
  angular
    .module('mapstory.search')
    .controller('storytellerController', storytellerController);

  function storytellerController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.author = autocompleteService.authors;
    
    var byUsername;

    function syncDisplay(){
      if( $scope.autocomplete.authors ){
        byUsername = $scope.autocomplete.authors.byUsername;
        
        vm.author.list = $scope.autocomplete.authors.all;
        vm.userChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.author.tidy;
      return _.map(tidy($scope.query), function (item) {
        return byUsername[item]
      }) || [];
    }

    $scope.$on('loadedOwners', function(){ syncDisplay(); });
    $scope.$on('topEvent', function(){ syncDisplay(); });
  }
})();