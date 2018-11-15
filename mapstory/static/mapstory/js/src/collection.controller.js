/*
 *  Collections Controller
 */
(() => {
  function collectionController($http, $scope) {
    $scope.query = groupId => {
      $http.get("/api/collections/").then(response => {
        // Determine which collection this is by using the group id
        const collections = response.data.objects;
        let data;
        for (let i = 0; i < collections.length; i++) {
          if (collections[i].group.id === groupId) {
            data = collections[i];
          }
        }
        $scope.avatar = data.group.logo;
        $scope.title = data.group.title;
        document.title = $scope.title;
        $scope.slug = data.group.slug;
        // grab only the media names
        $scope.facebook = data.group.social_facebook.split("/")[1];
        $scope.twitter = data.group.social_twitter.split("/")[1];
        $scope.tasks = data.group.tasks;
        $scope.interests = data.group.keywords;
        $scope.summary = data.group.description;
        $scope.city = data.group.city;
        $scope.country = data.group.country;
        // MapStories and StoryLayers need to separated because they are held together in the resources
        $scope.layers = [];
        $scope.maps = [];
        for (let i = 0; i < data.resources.length; i += 1) {
          const resourceType = data.resources[i].detail_url.split("/")[1];
          if (resourceType === "layers") {
            $scope.layers.push(data.resources[i]);
          } else if (resourceType === "maps") {
            $scope.maps.push(data.resources[i]);
          }
        }
        $scope.storytellers = data.users;

        // Create api query
        let apiQuery = "/api/base/?owner__username__in=";
        for (let i = 0; i < data.users.length; i++) {
          apiQuery += `${data.users[i].username},`;
        }
        // For organizations, need to grab the MapStories and StoryLayers created by all its users
        $scope.orgLayers = [];
        $scope.orgMaps = [];
        $http.get(apiQuery).then(res => {
          const results = res.data.objects;
          for (let i = 0; i < results.length; i++) {
            if (results[i].detail_url) {
              // Checks the type if it's a layer or map
              if (results[i].detail_url.indexOf("layers") > -1) {
                $scope.orgLayers.push(results[i]);
              } else {
                $scope.orgMaps.push(results[i]);
              }
            }
          }
        });
      });
    };
  }

  angular
    .module("mapstory")
    .controller("collectionController", collectionController);
})();
