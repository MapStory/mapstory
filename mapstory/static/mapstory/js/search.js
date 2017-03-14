'use strict';

(function(){

  var module = angular.module('geonode_main_search', ['ngMaterial'], function($locationProvider) {
      if (window.navigator.userAgent.indexOf("MSIE") == -1){
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
        // make sure that angular doesn't intercept the page links
        angular.element("a").prop("target", "_self");
      }
    });

  module.load_active_list = function ($http, $rootScope, $location, api, endpoint, filter){
      var params = typeof FILTER_TYPE == 'undefined' ? {} : {'type': FILTER_TYPE};
      $http.get(endpoint, {params: params}).success(function(data){
        //sets an active property if category already selected in a url query
        
        $rootScope[api]= data.objects;
      });
    }

  module.run(function($http, $rootScope, $location){
      module.load_active_list($http, $rootScope, $location, 'categories',
        CATEGORIES_ENDPOINT,'category__identifier__in');
  });

  module.filter('activated', function (){
    return function(value, property, query){

      //console.log(query);
      if(_.has(query,property)){
        return _.contains(query[property], value) || query[property] == value;
      }else{
        return false;
      }
    }
  });

  /*
  * Main search controller
  * Load data from api and defines the multiple and single choice handlers
  * Syncs the browser url with the selections
  */
  module.controller('geonode_search_controller', function($injector, $scope, $location, $http, $q, Configs){
    //load keywords and establish a very simple trending count
    
    $scope.query = $location.search();
    $scope.sitename = SITE_NAME;
    
    $http.get(KEYWORDS_ENDPOINT, {}).success(function(data){
      //exclude empty tags, order in descending order 
      //move this behavior to the api when possible
      var results = _.reject(data.objects, function(tag){ 
        return tag.count == 0; 
      })

      $scope.keywords = results = _.sortBy(results, function(tag) {
        return -tag.count;
      });

      setTopTags();
    })

    $scope.trending = {};

    function setTopTags(){
      // // Grab the top 12 or all // change the # displaying here
      // var displayLength = ($scope.keywords.length > 12) ? 12 : $scope.keywords.length;
      
      // for (var i = 0; i < displayLength; i++) {
      //   trending[$scope.keywords[i]['slug']] = $scope.keywords[i];
      // } 

      $scope.topTags = _.omit($scope.keywords, $scope.query['keywords__slug__in'])
    }

    $scope.query = $location.search();

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', function(){
        $location.search($scope.query);
      }, true);
    } 

    $scope.search = function() {
      return query_api($scope.query).then(function(result) {
        return result;
      });
    };

    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    // Set the default orderMethod for when a user first hits the Explore page to be descending views.
    $scope.orderMethod = '-popular_count';
    // Allow the user to choose an order method using the What's Hot section.
    $scope.orderMethodUpdate = function(orderMethod) {
      $scope.orderMethod = orderMethod;
    };

    /* USER VS CONTENT EXPLORE SETTINGS
    Persisting content and storyteller view & queries through page refresh */
    if ($scope.query.storyteller){
      //storyteller explore
      $scope.apiEndpoint = '/api/owners/';
    } else {
      //default to content explore
      $scope.apiEndpoint = '/api/base/search/';
      $scope.query.content = true;
      $scope.query.is_published = true;
    }

    // Make the content one active, user inactive
    $scope.toUserSearch = function() {
      $scope.apiEndpoint = '/api/owners/';
      $scope.query = { storyteller: true, limit: CLIENT_RESULTS_LIMIT, offset: 0 };
      $scope.search();
    };
    // Make the user one active, content inactive
    $scope.toContentSearch = function() {
      $scope.apiEndpoint = '/api/base/search/';
      $scope.query = { content: true, is_published: true, limit: CLIENT_RESULTS_LIMIT, offset: 0 };
      $scope.search();
    };

    //Get data from apis and make them available to the page
    function query_api(data){

      return $http.get($scope.apiEndpoint, {params: data || {}}).success(function(data){
        $scope.results = data.objects;
        $scope.total_counts = data.meta.total_count;
      });
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

      query_api($scope.query);
    }

    /*
    * Pagination 
    */

    $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);
    $scope.numpages = Math.round(($scope.total_counts / $scope.query.limit) + 0.49);

    // Control what happens when the total results change
    $scope.$watch('total_counts', function(){
      $scope.numpages = Math.round(
        ($scope.total_counts / $scope.query.limit) + 0.49
      );

      // In case the user is viewing a page > 1 and a 
      // subsequent query returns less pages, then 
      // reset the page to one and search again.
      if($scope.numpages < $scope.page){
        $scope.page = 1;
        $scope.query.offset = 0;
        query_api($scope.query);
      }

      // In case of no results, the number of pages is one.
      //if($scope.numpages == 0){$scope.numpages = 1};
    });

    $scope.paginate_down = function(){
      if($scope.page > 1){
        $scope.page -= 1;
        $scope.query.offset =  $scope.query.limit * ($scope.page - 1);
        query_api($scope.query);
      }   
    }

    $scope.paginate_up = function(){
      if($scope.numpages > $scope.page){
        $scope.page += 1;
        $scope.query.offset = $scope.query.limit * ($scope.page - 1);
        query_api($scope.query);
      }
    }

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
      query_api($scope.query);
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

    // Configure new autocomplete
    var keyword_autocompletes = [];
    var city_autocompletes = [];
    $scope.selectedCountries = [];
    $scope.selectedUsers = [];

    profile_autocomplete()
    keyword_autocomplete()
    region_autocomplete(); 

    function keyword_autocomplete() {
      return $http.get('/api/keywords/')
        .success(function(data){
          var results = data.objects;
          for (var i = 0; i < results.length; i++) {
            keyword_autocompletes.push(results[i].slug);
          }
        });
    };

    function profile_autocomplete() {
      return $http.get('/api/owners/')
        .success(function(data){
          var results = data.objects;

        $scope.myProfiles = _.map(results, function (veg) {
          veg._lowerfirst = veg.first_name.toLowerCase();
          veg._lowerlast = veg.last_name.toLowerCase();
          veg._lowername = veg.username.toLowerCase();
          return veg;
        });
     //results[i].city
     //$scope.add_search('city', e.attrs.value, cities);          
      });
    }

    $scope.tellerSearch = function (query) {
      var results = query ? $scope.myProfiles.filter(createFilterFor2(query)) : [];
      return results;
    };

    /**
     * Create filter function for a query string
     */
    function createFilterFor2(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(vegetable) {
        return (vegetable._lowername.indexOf(lowercaseQuery) > -1) ||
            (vegetable._lowerfirst.indexOf(lowercaseQuery) > -1) ||
            (vegetable._lowerlast.indexOf(lowercaseQuery) > -1);
      };
    }

    function region_autocomplete() {
      return $http.get('/api/regions/')
        .success(function(data){
          var results = data.objects;
          //$scope.countryIndex = _.indexBy(results, 'code');
          // results = _.reject(results, function(co){ return co.level == 1; });
          $scope.countryIndex = _.map(results, function (veg) {
              veg._lowername = veg.name.toLowerCase();
              veg._lowertype = veg.code.toLowerCase();
              return veg;
            });
          });
      };

    $scope.querySearch = function (query) {
      var results = query ? $scope.countryIndex.filter(createFilterFor(query)) : [];
      return results;
    };

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(vegetable) {
        return (vegetable._lowername.indexOf(lowercaseQuery) > -1) ||
            (vegetable._lowertype.indexOf(lowercaseQuery) > -1);
      };
    }

// $scope.add_search('country', country_codes[region_autocompletes.indexOf(e.attrs.value)], countries);
// $scope.remove_search('country', country_codes[region_autocompletes.indexOf(e.attrs.value)], countries);

    $scope.filterVTC = function() {
      // When VTC check box is clicked, also filter by VTC; when unchecked, reset it
      if ($scope.VTCisChecked == true) {
        $scope.itemFilter['Volunteer_Technical_Community'] = true;
      } else {
        $scope.itemFilter = { is_active: true };
      }
    };
    $scope.filterVTC();
    $scope.search();
  });

  // add filter to decode uri
  module.filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  }); 

})
();