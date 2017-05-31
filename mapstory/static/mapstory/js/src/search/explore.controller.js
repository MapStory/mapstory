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
    $scope.sitename = SITE_NAME; //used in content_sidebar

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
      // we expose offset and limit for manipulation in the url,
      // validate them for error cases here
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

    $scope.clearVTC = function(){
      $scope.VTCisChecked = false;
      $scope.filterVTC();
      $scope.search();
    };

    $scope.filterVTC = function() {
      // When VTC check box is clicked, also filter by VTC; when unchecked, reset it
      if ($scope.VTCisChecked == true) {
        $scope.VTCisChecked = false;
        $scope.itemFilter = { is_active: true };
      } else {
        $scope.VTCisChecked = true;
        $scope.itemFilter = {Volunteer_Technical_Community: true};
      }
    };

    //Checkbox selection syncing with query
    $scope.isActivated = function (item, list, filter) {
      if(list[filter]){
        return list[filter].indexOf(item) > -1;
      } 
    };

    /// here lie query methods
    // add, remove, checkbox( aka, toggle), and clear
    
    $scope.addQuery = queryService.addQuery.bind($scope);
    $scope.removeQuery = queryService.removeQuery.bind($scope);

    $scope.checkboxQuery = function($event){
      var element = $($event.target);
      var filter = element.attr('data-filter');
      var value = element.attr('data-value');

      queryService.toggleQuery.apply($scope, [filter, value]);
    };
    
    $scope.clear = function(filter){
      delete($scope.query[filter]);
      $scope.search();
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

    /* USER VS CONTENT EXPLORE SETTINGS
    Persisting content and storyteller view & queries through page refresh */

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
        offset: 0 
      };
      $scope.search();
    };
    
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
    }

    $scope.search();
  }
})();