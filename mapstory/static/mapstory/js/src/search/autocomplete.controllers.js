/*
* Autocomplete Controllers
*/

(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('countriesController', countriesController)
      .controller('citiesController', citiesController)
      .controller('storytellerController', storytellerController)
      .controller('tagsController', tagsController)
      .controller('interestsController', interestsController);

  function countriesController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.countries;
      
    $scope.$on('loadedCountries', function(){
      if( $scope.lists.countries ){
        vm.auto.list = $scope.lists.countries.list;
        vm.index = $scope.lists.countries.index;
        vm.selectedCountries = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.countries ){
        vm.selectedCountries = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    });
  }

  function storytellerController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.authors;
    
    $scope.$on('loadedOwners', function(){
      if( $scope.lists.profiles ){
        vm.auto.list = $scope.lists.profiles.list;
        vm.index = $scope.lists.profiles.index;
        vm.selectedUsers = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.profiles ){
        vm.selectedUsers = _.map(vm.auto.tidy($scope.query), function (user) {
          return vm.index[user];
        }) || [];
      }
    });
  }

  function citiesController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.cities;


    vm.newCity = function(chip) {
      return chip.city ? chip : {city: chip};
    };

   vm.selectedCities = _.map(vm.auto.tidy($scope.query), function (item) {
      return {city: item};
    }) || [];
      
    $scope.$on('loadedOwners', function(){
      if( $scope.lists.cities ){
        vm.auto.list = $scope.lists.cities.list;
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.cities ){
        vm.selectedCities = _.map(vm.auto.tidy($scope.query), function (item) {
          return {city: item};
        }) || [];
      }
    });
  }

  function interestsController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.interests;
    
    vm.selectedInterests = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];

    vm.newInterest = function(chip) {
      return chip.slug ? chip : {slug: chip};
    };

    $scope.$on('loaded', function(){
      if($scope.lists.keywords)
        vm.auto.list = $scope.lists.keywords.list;
    })

    $scope.$on('topEvent', function(){
      vm.selectedInterests = _.map(vm.auto.tidy($scope.query), function (item) {
          return {slug: item};
        }) || [];
    });
  }

  function tagsController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.tags;

    vm.selectedTags = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];

    vm.newTag = function(chip) {
      return chip.slug ? chip : {slug: chip};
    };

    $scope.$on('loaded', function(){
      if($scope.lists.keywords){
        vm.auto.list = $scope.lists.keywords.list;
        vm.trending = $scope.lists.keywords.trending
        setTopTags();
      }
    })
    
    $scope.$on('topEvent', function(){
      vm.selectedTags = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];
      setTopTags();
    });
    
    function setTopTags(){
      vm.topDisplay = _.difference($scope.lists.keywords.trending, vm.auto.tidy($scope.query))
    }
  }
})();