/*
 *  Profile Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('profileController', profileController);

  function profileController($injector, $scope, $location, $http, UploadedData, $rootScope) {    
    //resources: stories, layers
    $scope.query = {}
    $scope.query.owner__username__in = PROFILE_USERNAME;
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    //todo: complete pagination directive for profile resources > than 30 item limit
    // $scope.query.offset = $scope.query.offset || 0;
    // $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);

    //if not the owner, don't retrieve unpublished resources
    // needs better permissions management for superusers/admin
    if (USER != PROFILE_USERNAME && USER != 'admin'){
      $scope.query.is_published = true;
    }

    //uploads
    $scope.uploads = [];
    $scope.loading = true;
    $scope.currentPage = 0;
    $scope.offset = 0;
    $scope.limit = 10;

    $scope.init = function(user) {
      get_stories_and_layers();
      getUploads({offset: $scope.offset, limit: $scope.limit, user__username: user});
    };

    /* Resource Methods */
    $scope.search = function() {
      return query_api($scope.query).then(function(result) {
          return result;
      });
    };

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}})
      .then(
        /* success */
        function(response) {
          $scope.results = response.data.objects;
          $scope.total_counts = response.data.meta.total_count;
          $scope.$root.query_data = response.data;
        },
        /* failure */
        function(error) {
          console.log("The request failed: ", error);
        }
      )
    };

    // count and & stash results for layers & stories 
    function get_stories_and_layers() {
      $scope.query.type__in = 'layer';
      $scope.search().then(function(result) {
        $scope.total_layers = $scope.total_counts;
        $scope.layers = $scope.results;
        $scope.query.type__in = 'mapstory';
        $scope.search().then(function(result) {
          $scope.total_maps = $scope.total_counts;
          $scope.stories = $scope.results;
        });
      });
    };

    //content card animation
    $scope.flip = function(id){
      $('.resource-'+id).toggleClass('flip');
    };

    /* Uploads Methods */
    $scope.pageChanged = function() {
      $scope.offset = ($scope.currentPage - 1) * $scope.limit;
      var query = {offset: $scope.offset, limit: $scope.limit};
      getUploads(query);
    };

    function getUploads(query) {
      if (query == null) {
        query = {offset: $scope.offset, limit: $scope.limit, user__username: $scope.user}
      }
      
      UploadedData.query(query).$promise.then(function(data) {
        $scope.uploads = data.objects;
        $scope.offset = data.meta.offset;
        $scope.totalItems = data.meta.total_count;
        $scope.loading = false;
      });
    }

    $rootScope.$on('upload:complete', function(event, args) {
        if (args.hasOwnProperty('id')) {
            getUploads();
        }
    });

    /* Collection Methods(?) */
    $scope.showUserGroup = function() {
        if ($location.search().hasOwnProperty('type__in')) {
            var typeInParam = $location.search()['type__in'];
            if (typeof(typeInParam) === "string") {
                if (typeInParam === 'user' || typeInParam === 'group') {
                    return true;
                }
            } else if (typeof(typeInParam) === "object") {
                for(var i = 0; i < typeInParam.length; i++) {
                  if(typeInParam[i] === 'user' || typeInParam[i] === 'group') {
                      return true;
                    }
                };
            }
          }
        return false;
    };
  }
})();