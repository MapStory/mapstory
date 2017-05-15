  /*
  * Explore Page Controller
  */

  (function() {
  'use strict';

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs) {
    $scope.query = $location.search();
    $scope.sitename = SITE_NAME; //used in content_sidebar

    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;

    $scope.lists = {};
    $scope.autocomplete = {};

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', function(newValue, oldValue){
        $location.search($scope.query);
        $scope.$broadcast('updateSelection');
      }, true);
    } 

    $scope.search = function() {
      return query_api($scope.query).then(function(result) {
        return result;
      });
    };

    //Get data from apis and make them available to the page
    function query_api(data){

      return $http.get($scope.apiEndpoint, {params: data || {}})
        .then(
          /* success */
          function(response) {
            $scope.results = response.data.objects;
            $scope.total_counts = response.data.meta.total_count;
            $scope.numpages = Math.round(($scope.total_counts / $scope.query.limit) + 0.49);
            $scope.numresults = Number($scope.query.offset) + Number($scope.results.length);
            $scope.resultStart = Number($scope.query.offset) + 1;
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
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
        
        console.log($scope.itemFilter);
      } else {
        $scope.VTCisChecked = true;
        $scope.itemFilter = {Volunteer_Technical_Community: true};
        
        console.log($scope.itemFilter);
      }
    };

    // REINSTATE AFTER API HAS BEEN UPDATED FOR VTC FILTER
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
    $scope.orderMethodContent = '-popular_count';
    $scope.orderMethodStoryteller = 'username';

    $scope.orderMethods = {
      content:
        [
          {name:'Popular', filter:'-popular_count'},
          {name:'Newest', filter:'-date'}
        ], 
      storyteller:
        [
          {name: 'Username Z-A', filter: '-username'},
          {name: 'Username A-Z', filter: 'username'}
        ]
    };

    /*
    * Pagination 
    */
    $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);
    $scope.numpages = Math.round(($scope.total_counts / $scope.query.limit) + 0.49);
    $scope.resultStart = Number($scope.query.offset) + 1;

    function updateOffset(){
      $scope.query.offset =  $scope.query.limit * ($scope.page - 1);
    }

    $scope.pageDown = function(){
      if($scope.page > 1){
        $scope.page -= 1;
        updateOffset();
        $scope.search();
      }   
    };

    $scope.pageUp = function(){
      if($scope.page < $scope.numpages){
        $scope.page += 1;
        updateOffset();
        $scope.search();
      }
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
      $scope.apiEndpoint = '/api/base/search/';
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
      $scope.apiEndpoint = '/api/base/search/';

      //add is_published even if they've removed it,
      //but persist all other filters
      $scope.query.is_published = true;
    }

    $scope.search();
  }
})();