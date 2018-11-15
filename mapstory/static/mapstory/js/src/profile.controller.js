/*
 *  Profile Controller
 */
(() => {
  angular
    .module("mapstory")
    .controller("profileController", profileController)
    .controller("layersController", layersController)
    .controller("storiesController", storiesController);

  function profileController($injector, $scope, $http) {
    $scope.counts = {};
    $scope.interestChips = interests;

    $scope.query = {
      owner__username__in: window.PROFILE_USERNAME,
      limit: window.CLIENT_RESULTS_LIMIT,
      offset: 0
    };

    // if not the owner, don't retrieve unpublished resources
    // needs better permissions management for superusers/admin
    if (window.USER != window.PROFILE_USERNAME && window.USER != "admin") {
      $scope.query.is_published = true;
    }

    // Get data from apis and make them available to the page
    function getResourceCounts() {
      return $http.get(window.SEARCH_URL, { params: $scope.query || {} }).then(
        /* success */
        response => {
          const facets = response.data.meta.facets;
          let layerCount;
          let storyCount;

          // if type facets are present, store them
          if (facets.type) {
            layerCount = facets.type.layer;
            storyCount = facets.type.mapstory;
          }

          // assign type facet counts or a default of 0
          // displays as a total on the profile tabs
          $scope.counts.layers = layerCount || 0;
          $scope.counts.maps = storyCount || 0;
        },
        /* failure */
        error => {
          console.log("The request failed: ", error);
        }
      );
    }

    getResourceCounts();
  }

  function layersController($injector, $scope, $http, page) {
    const vm = this;

    vm.search = () => {
      // use profile query, but also only get layers
      const query = _.extend({ type__in: "layer" }, $scope.query);

      return $http.get(window.SEARCH_URL, { params: query || {} }).then(
        /* success */
        response => {
          vm.cards = response.data.objects;
          page.paginate(response, vm, $scope);
        },
        /* failure */
        error => {
          console.log("The request failed: ", error);
        }
      );
    };

    vm.pageDown = page.down(vm, $scope);
    vm.pageUp = page.up(vm, $scope);

    vm.search();
  }

  function storiesController($injector, $scope, $http, page) {
    const vm = this;

    // Get data from apis and make them available to the page
    vm.search = () => {
      // use profile query, but also only get mapstories
      const query = _.extend({ type__in: "mapstory" }, $scope.query);

      return $http.get(window.SEARCH_URL, { params: query || {} }).then(
        /* success */
        response => {
          vm.cards = response.data.objects;
          page.paginate(response, vm, $scope);
        },
        /* failure */
        error => {
          console.log("The request failed: ", error);
        }
      );
    };

    vm.pageDown = page.down(vm, $scope);
    vm.pageUp = page.up(vm, $scope);

    vm.search();
  }
})();
