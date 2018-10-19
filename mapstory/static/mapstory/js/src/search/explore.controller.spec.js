describe('exploreController', function() {
  beforeEach(module('mapstory.search'));

  var $controller;
  var $scope, $rootScope, $location, createController, $http, $q, Configs, page;

 beforeEach(inject(function ($injector) {

    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $http = $injector.get('$http');
    $q = $injector.get('$q');
    Configs = $injector.get('Configs');
    page = $injector.get('page');
  
    $location = $injector.get('$location');

    $scope = $rootScope.$new();

    $controller = $injector.get('$controller');

    createController = function () {
      return $controller('exploreController', {
        $scope: $scope,
        $location: $location,
        $http: $http, 
        $q: $q, 
        Configs: Configs, 
      });
    };

    createController();
  }));

  it('should have a default order method of Popular', function () {
    expect($scope.orderMethodContent).to.equal('-popular_count');
  });
});