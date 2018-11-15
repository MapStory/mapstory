describe('exploreController', () => {
  beforeEach(module('mapstory.search'));

  let $controller;
  let $scope; let $rootScope; let $location; let createController; let $http; let $q; let Configs; let page;

 beforeEach(inject(($injector) => {

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
        $scope,
        $location,
        $http, 
        $q, 
        Configs, 
      });
    };

    createController();
  }));

  it('should have a default order method of Popular', () => {
    expect($scope.orderMethodContent).to.equal('-popular_count');
  });
});