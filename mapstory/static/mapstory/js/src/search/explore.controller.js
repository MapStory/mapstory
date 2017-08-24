  /*
  * Explore Page Controller
  */

  (function() {
  'use strict';

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs, page, queryService) {
    var vm = this;

    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;

    $scope.autocomplete = {};

    $scope.pageDown = page.down(vm, $scope);
    $scope.pageUp = page.up(vm, $scope);

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', function(newValue, oldValue){
        $location.search($scope.query);
        $scope.$broadcast('updateSelection');
      }, true);
    } 

    $scope.search = function() {
      // we expose offset and limit for manipulation in the browser url,
      // validate them for error cases here (not needed when not exposed)
      queryService.validateOffset($scope);
      queryService.validateLimit($scope);

      return $http.get($scope.apiEndpoint, {params: $scope.query || {}})
        .then(
          /* success */
          function(response) {
            $scope.cards = response.data.objects;
            page.paginate(response, vm, $scope);
          },
          /* failure */
          function(error) {
            if( error.data.error_message === "Sorry, no results on that page." ){
              console.log("Setting offset to 0 and searching again.");
              queryService.resetOffset($scope);
            } else {
              console.log(error);
            }
          }
        )
    };



    ////////////////////////////
    /*  Query Methods */
    // add, remove, checkbox( aka, toggle), and clear
    // activation of checkboxes on refresh
    // vtc front end filtering
    
    vm.addQuery = queryService.addQuery.bind($scope);
    vm.removeQuery = queryService.removeQuery.bind($scope);

    vm.checkboxQuery = function($event){
      var element = $($event.target);
      var filter = element.attr('data-filter');
      var value = element.attr('data-value');

      // toggle this filter:value on/off on the query
      queryService.toggleQuery.apply($scope, [filter, value]);
    };

    //Checkbox selection syncing with query
    $scope.isActivated = function (item, list, filter) {
      if(list[filter]){
        return list[filter].indexOf(item) > -1;
      } 
    };
    
    vm.clear = function(filter){
      delete($scope.query[filter]);
      $scope.search();
    };

    // Volunteer Technical Community checkbox is a front-end show/hide filter
    // The following functions toggle the visibility of the _result_users card

    vm.clearVTC = function(){
      vm.VTCisChecked = false;
      $scope.itemFilter = { is_active: true };
      $scope.search();
    };

    vm.filterVTC = function() {
      // When VTC check box is clicked, also filter by VTC; when unchecked, reset it
      if (vm.VTCisChecked) {
        $scope.itemFilter = {Volunteer_Technical_Community: true}; 
      } else {
        $scope.itemFilter = { is_active: true };  
      }
    };

    //////////////
    /* ORDERING */
    //set default order methods for content and storyteller
    $scope.orderMethodContent = '-popular_count';
    $scope.orderMethodStoryteller = 'username';

    //expose additional sorting to the dropdown "sort by"
    $scope.orderMethods = {
      //for general content results
      content:
        [
          {name:'Popular', filter:'-popular_count'},
          {name:'Newest', filter:'-date'}
        ], 
        //for the storyteller results
      storyteller:
        [
          {name: 'Username Z-A', filter: '-username'},
          {name: 'Username A-Z', filter: 'username'}
        ]
    };
    /////////////////////
    /* USER VS CONTENT */
    // Persisting content and storyteller view & queries through page refresh 

    // Make the content one active, user inactive
    $scope.defaultOwners = function() {
      $scope.apiEndpoint = '/api/owners/';
      $scope.query = { 
        storyteller: true, 
        limit: CLIENT_RESULTS_LIMIT, 
        offset: 0 
      };
     $scope.search();
    };

    // Make the user one active, content inactive
    $scope.defaultContent = function() {
      $scope.apiEndpoint = SEARCH_URL;
      $scope.query = { 
        content: true, 
        is_published: true, 
        limit: CLIENT_RESULTS_LIMIT, 
        offset: 0,
        order_by: '-popular_count'
      };
      $scope.search();
    };
    
    //// Default settings upon landing (without clicking topbar/switch) ///
    if ($scope.query.storyteller){
      //storyteller explore
      $scope.apiEndpoint = '/api/owners/';
    } else {
      //set it to content
      $scope.query.content = true;

      //default to content explore
      $scope.apiEndpoint = SEARCH_URL;

      //add is_published even if they've removed it,
      //but persist all other filters
      $scope.query.is_published = true;
      // default order method for content
      $scope.query.order_by='-popular_count';
    }

    $scope.search();
  }
})();