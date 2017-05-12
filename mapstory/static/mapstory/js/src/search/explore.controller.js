  /*
  * Explore Page Controller
  */

  (function() {
  'use strict';

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs, page) {
    $scope.query = $location.search();
    $scope.sitename = SITE_NAME; //used in content_sidebar

    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;

    $scope.autocomplete = {};

    var vm = this;

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', function(newValue, oldValue){
        $location.search($scope.query);
        $scope.$broadcast('updateSelection');
      }, true);
    } 

    $scope.search = function() {
      if($scope.query.limit == 0){
        console.log("Reseting to default CLIENT_RESULTS_LIMIT, cannot query API with a 0 limit")
        $scope.query.limit = CLIENT_RESULTS_LIMIT;
      }
      // verify that offset is a multiple of limit before querying API
      if($scope.query.limit != 0 && $scope.query.offset % $scope.query.limit != 0) {
        $scope.query.offset = page.roundOffset($scope);
      }

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
              page.resetOffset($scope);
            } else {
              console.log(error);
            }
          }
        )
    };
    
    /* Pagination */

    $scope.pageDown = page.down(vm, $scope);
    $scope.pageUp = page.up(vm, $scope);


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
        
        // console.log($scope.itemFilter);
      } else {
        $scope.VTCisChecked = true;
        $scope.itemFilter = {Volunteer_Technical_Community: true};
        
        // console.log($scope.itemFilter);
      }
    };

    // // REINSTATE AFTER API HAS BEEN UPDATED FOR VTC FILTER
    // /* handling checkboxy on/off filters and display */
    // $scope.VTC = function(){
    //   if($scope.query.Volunteer_Technical_Community == false){
    //     delete($scope.query.Volunteer_Technical_Community);
    //   }
    //   $scope.search();
    // };

    //Checkbox selection syncing with query
    $scope.isActivated = function (item, list, filter) {
      if(list[filter]){
        return list[filter].indexOf(item) > -1;
      } 
    };

    /*
    * Add the selection behavior to the element, it adds/removes the 'active' class
    * and pushes/removes the value of the element from the query object
    */
    $scope.multiple_choice_listener = function($event){
      var element = $($event.target);
      var query_entry = [];
      var data_filter = element.attr('data-filter');
      var value = element.attr('data-value');

      // If the query object has the record then grab it
      if ($scope.query.hasOwnProperty(data_filter)){

        // When in the location are passed two filters of the same
        // type then they are put in an array otherwise is a single string
        if ($scope.query[data_filter] instanceof Array){
          query_entry = $scope.query[data_filter];
        }else{
          query_entry.push($scope.query[data_filter]);
        }
      }

      if (query_entry.indexOf(value) == -1){
        query_entry.push(value);
      } else {
         query_entry.splice(query_entry.indexOf(value), 1);
      }
        
      //save back the new query entry to the scope query
      $scope.query[data_filter] = query_entry;

      //if the entry is empty then delete the property from the query
      if(query_entry.length == 0){
        delete($scope.query[data_filter]);
      }

      $scope.search();
    };

    /* functionality for tagging and queries */     
    $scope.add_query = function(filter, value) {
      var query_entry = [];
      if ($scope.query.hasOwnProperty(filter)) {
        //if theres a list of items, grab them. otherwise, add the only value to empty list
        if ($scope.query[filter] instanceof Array) {
          query_entry = $scope.query[filter];
        } else {
          query_entry.push($scope.query[filter]);
        }
        // Only add it if this value doesn't already exist
        // Apparently this doesn't exactly work...
        if ($scope.query[filter].indexOf(value) == -1) {
          query_entry.push(value);
        }
      } else {
        query_entry = [value];
      }
      $scope.query[filter] = query_entry;
      $scope.search();
    };

    $scope.remove_query = function (filter, value) {
      var query_entry = [];
      // First check if this even exists to remove
      if ($scope.query.hasOwnProperty(filter)) {
        // Grab the current query
        if ($scope.query[filter] instanceof Array) {
          query_entry = $scope.query[filter];
        } else {
          query_entry.push($scope.query[filter]);
        }
        // Remove this value
        query_entry.splice(query_entry.indexOf(value), 1);
        // Update and run the query
        $scope.query[filter] = query_entry;
        query_api($scope.query);
      }
    };

    $scope.clear = function(filter){
      delete($scope.query[filter]);
      $scope.search();
    };

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