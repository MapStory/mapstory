/*
 *  Profile Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('profileController', profileController);

  function profileController($injector, $scope, $location, $http, Django, UploadedData, $rootScope) {
    $scope.django = Django.all();
    
    //resources: stories, layers
    $scope.query = {}
    $scope.query.owner__username__in = PROFILE_USERNAME;
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    //todo: complete pagination directive for profile resources > than 30 item limit
    // $scope.query.offset = $scope.query.offset || 0;
    // $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);

    //if not the owner, don't retrieve unpublished resources
    // needs better permissions management for superusers/admin
    if ($scope.django.user != PROFILE_USERNAME && $scope.django.user != 'admin'){
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
        .success(function(data){
          $scope.results = data.objects;
          $scope.total_counts = data.meta.total_count;
          $scope.$root.query_data = data;
      });
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

    /* Tokenization of user interests */
    // For some reason it gets it all as a string, so parse for the ' and grab the content in between them
    keyword_list = keyword_list.split('\'');
    var interests = [];
    // Grab every odd numbered index - hack to grab the keywords only
    for (var i = 1; i < keyword_list.length; i += 2) {
      interests.push(keyword_list[i]);
    }
    // Manually set the value field
    var value = $('#tokenfield-interests').val(interests);
    // Only initialize the tokenfield once the values are set
    if (value) {
      $('#tokenfield-interests').tokenfield({
        limit: 10
      });
      $('#tokenfield-interests').tokenfield('readonly');
    }
    // If a label is clicked, do a manual redirect to the explore page with the value
    // of the token as the keyword search filter
    $('.token-label').click(function(e) {
      var interest = $(e.target).text();
      window.location.href = '/search/?limit=30&offset=0&type__in=user&interest_list=' + interest;
    });
  }
})();