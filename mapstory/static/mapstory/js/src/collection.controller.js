/*
 *  Collections Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('collectionController', collectionController);

  function collectionController($http, $scope) {
    $scope.query = function(group_id) {
      $http.get('/api/collections/').then(function(response) {
        // Determine which collection this is by using the group id
        var collections = response.data.objects;
        var data;
        for (var i = 0; i < collections.length; i++) {
          if (collections[i].group.id == group_id) {
            data = collections[i];
          }
        }
        $scope.avatar = data.group.logo;
        $scope.title = data.group.title;
        document.title = $scope.title;
        $scope.slug = data.group.slug;
        // grab only the media names
        $scope.facebook = data.group.social_facebook.split('/')[1];
        $scope.twitter = data.group.social_twitter.split('/')[1];
        $scope.tasks = data.group.tasks;
        $scope.interests = data.group.keywords;
        $scope.summary = data.group.description;
        $scope.city = data.group.city;
        $scope.country = data.group.country;
        // MapStories and StoryLayers need to separated because they are held together in the resources
        $scope.layers = [];
        $scope.maps = [];
        for (var i = 0; i < data.resources.length; i++) {
          var resource_type = data.resources[i].detail_url.split('/')[1];
          if (resource_type == 'layers') {
            $scope.layers.push(data.resources[i]);
          } else if (resource_type == 'maps') {
            $scope.maps.push(data.resources[i]);
          }
        }
        $scope.storytellers = data.users;

        // Create api query
        var api_query = '/api/base/?owner__username__in=';
        for (var i = 0; i < data.users.length; i++) {
          api_query += data.users[i].username + ',';
        }
        // For organizations, need to grab the MapStories and StoryLayers created by all its users
        $scope.org_layers = [];
        $scope.org_maps = [];
        $http.get(api_query).then(function(response) {
          var results = response.data.objects;
          for (var i = 0; i < results.length; i++) {
            if (results[i].detail_url) {
              // Checks the type if it's a layer or map
              if (results[i].detail_url.indexOf('layers') > -1) {
                $scope.org_layers.push(results[i]);
              } else {
                $scope.org_maps.push(results[i]);
              }
            }
          }
        });

        var keywords_list = data.group.keywords;

        // var MAX_TOKENS = 10;
        // $('#tokenfield-interests').val(keywords_list);
        // $('#tokenfield-interests').tokenfield({
        //   limit: MAX_TOKENS
        // });
        // $('#tokenfield-interests').tokenfield('readonly');
        // $('.token-label').click(function(e) {
        //   var tag = $(e.target).text();
        //   window.location.href = '/search/?limit=100&offset=0&keywords__slug__in=' + tag;
        // });
      });
    };
  }
})();