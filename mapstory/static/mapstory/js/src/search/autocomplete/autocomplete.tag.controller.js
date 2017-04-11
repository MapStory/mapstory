/*
* Tag / Keyword Autocomplete Controller
*/

(function() {
'use strict';
  angular
    .module('mapstory.search')
    .controller('tagsController', tagsController);

  function tagsController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.tags = autocompleteService.tags;

    function syncDisplay(){
      if( $scope.lists.keywords){  
        vm.tags.list = $scope.lists.keywords.list; 
        vm.tagChips = transformChips();
      }
    }

    function setTopTags(tidiedTagList){
      vm.topDisplay = _.difference($scope.lists.keywords.trending, tidiedTagList);
    }

    function transformChips(){
      var tidy = vm.tags.tidy;
      var tidyTags = tidy($scope.query);

      setTopTags(tidyTags);

      return _.map(tidyTags, function (item) {
        return {'slug': item};
      }) || [];
    } 
    
    $scope.$on('loaded', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();