  /*
  * Explore Page Controller
  */

  (function() {
  

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs, page, queryService) {
    const vm = this;

    $scope.query = $location.search();
    $scope.SITE_NAME = SITE_NAME;
    $scope.BRANDING_STORY_NAME = BRANDING_STORY_NAME;
    $scope.BRANDING_STORIES_NAME = BRANDING_STORIES_NAME;
    $scope.BRANDING_LAYER_NAME = BRANDING_LAYER_NAME;
    $scope.BRANDING_LAYERS_NAME = BRANDING_LAYERS_NAME;
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;

    $scope.autocomplete = {};

    $scope.pageDown = page.down(vm, $scope);
    $scope.pageUp = page.up(vm, $scope);

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', (newValue, oldValue) => {
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
          (response) => {
            $scope.cards = response.data.objects;
            page.paginate(response, vm, $scope);
          },
          /* failure */
          (error) => {
            if( error.data.error_message === "Sorry, no results on that page." ){
              console.log("Setting offset to 0 and searching again.");
              queryService.resetOffset($scope);
            } else {
              console.log(error);
            }
          }
        )
    };
    
    // //////////////////////////
    /*  Query Methods */
    // add, remove, checkbox( aka, toggle), and clear
    // activation of checkboxes on refresh
    // vtc front end filtering
    
    vm.addQuery = queryService.addQuery.bind($scope);
    vm.removeQuery = queryService.removeQuery.bind($scope);

    vm.checkboxQuery = function($event){
      const element = $($event.target);
      const filter = element.attr('data-filter');
      const value = element.attr('data-value');

      // toggle this filter:value on/off on the query
      queryService.toggleQuery.apply($scope, [filter, value]);
    };

    // Checkbox selection syncing with query
    $scope.isActivated = function (item, list, filter) {
      if(list[filter]){
        return list[filter].indexOf(item) > -1;
      } 
    };
    
    vm.clear = function(filter){
      delete($scope.query[filter]);
      $scope.search();
    };

    // ////////////
    /* ORDERING */
    // expose additional sorting to the dropdown "sort by"
    $scope.orderingOptions = {
      // select order_by options from the Resource API
      resource:
        [
          { name:'Popular', 
            sort:'-popular_count'
          },
          { name:'Newest',
            sort:'-date'
          }
        ], 
      // seclect order_by options from the Owners API
      owner:
        [
          {
            name: 'First Name A-Z',
            sort: 'first_name'
          },
          {
            name: 'First Name Z-A',
            sort: '-first_name'
          },
          { name: 'Last Name A-Z',
            sort: 'last_name'
          },
          { name: 'Last Name Z-A',
            sort: '-last_name'
          }
        ],
      name:
        [
          {
            name: 'Group Name Z-A',
            sort: '-name'
          },
          {
            name: 'Group Name A-Z',
            sort: 'name'
          }
        ]
    };

    // set up a quick watch to re-pull results from API when ordering is changed
    // todo: sync this up in other watches if we can for performance 
    $scope.$watch('query["order_by"]', (newValue, oldValue, scope) => {
      $scope.search();
    });

    // ///////////////////
    /* USER VS CONTENT */
    // Persisting content and storyteller view & queries through page refresh 

    // Make the content one active, user inactive
    $scope.defaultOwners = function() {
      $scope.apiEndpoint = '/api/owners/';
      $scope.query = { 
        storyteller: true, 
        limit: CLIENT_RESULTS_LIMIT, 
        offset: 0,
        order_by: 'last_name'
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

    $scope.showGroups = function() {
      $scope.apiEndpoint = '/teams/api/team';
      $scope.query = {
        groups: true,
        is_active: true,
        limit: CLIENT_RESULTS_LIMIT,
        offset: 0,
      };
      $scope.search();
    };
    
    // // Default settings upon landing (without clicking topbar/switch) ///
    if ($scope.query.storyteller) {
      // storyteller explore
      $scope.apiEndpoint = '/api/owners/';
    }
    else if ($scope.query.groups) {
      $scope.apiEndpoint = '/teams/api/team';
      $scope.query.is_active = true;
    }
    else {
      // set it to content
      $scope.query.content = true;

      // default to content explore
      $scope.apiEndpoint = SEARCH_URL;

      // add is_published even if they've removed it,
      // but persist all other filters
      $scope.query.is_published = true;
      // default order method for content
      $scope.query.order_by='-popular_count';
    }

    $scope.search();
  }
})();