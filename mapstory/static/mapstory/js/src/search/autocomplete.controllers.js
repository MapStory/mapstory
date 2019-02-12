(function() {
  angular
    .module("mapstory.search")
    .controller("interestsController", interestsController)
    .controller("tagsController", tagsController)
    .controller("citiesController", citiesController)
    .controller("searchController", searchController)
    .controller("storytellerController", storytellerController)
    .controller("countriesController", countriesController);
  /*
   * Interests Autocomplete Controller
   */
  function interestsController(
    $injector,
    $scope,
    chipFieldFactory,
    dataService
  ) {
    const vm = this;
    vm.interests = new chipFieldFactory("interests", "slug");
    vm.async = function(searchText) {
      return dataService.getInterests({ slug__icontains: searchText });
    };

    function interestChipSync() {
      const currentQuery = vm.interests.tidy($scope.query);
      // updates countryChips model with tidy, transformed list of actively selected countries
      vm.chips = vm.interests.transform(currentQuery);
      vm.disabled = vm.chips.length >= 1;
    }

    $scope.$on("updateSelection", () => {
      interestChipSync();
    });

    interestChipSync();
  }

  /*
   * Tag / Keyword Autocomplete Controller
   */
  function tagsController($injector, $scope, chipFieldFactory, dataService) {
    const vm = this;
    vm.field = new chipFieldFactory("keywords__slug__in", "slug");
    vm.async = function(searchText) {
      console.log(dataService.getKeywords({ slug__icontains: searchText }));
      return dataService.getKeywords({ slug__icontains: searchText });
    };

    function tagChipSync() {
      const currentQuery = vm.field.tidy($scope.query);
      vm.chips = vm.field.transform(currentQuery);
      vm.placeholder =
        vm.chips.length > 0 ? "Expand your Tag Filter..." : "Filter by tag...";
    }

    $scope.$on("updateSelection", () => {
      tagChipSync();
    });

    tagChipSync();
  }

  /*
   * Cities Autocomplete Controller
   */
  function citiesController($injector, $scope, chipFieldFactory, dataService) {
    const vm = this;
    vm.cities = new chipFieldFactory("city__icontains", "city");
    vm.async = function(searchText) {
      return dataService.getOwners({ city__icontains: searchText });
    };

    function cityChipSync() {
      const currentQuery = vm.cities.tidy($scope.query);
      vm.cityChips = vm.cities.transform(currentQuery);
      if (vm.cityChips) vm.disabled = vm.cityChips.length >= 1;
    }

    $scope.$on("updateSelection", () => {
      cityChipSync();
    });

    cityChipSync();
  }
  /*
   * Search Autocomplete Controller
   */
  function searchController($injector, $scope, chipFieldFactory, dataService) {
    const vm = this;
    vm.search = new chipFieldFactory("q", "title");
    vm.async = function(searchText) {
      console.log(dataService.getSearchData({ q: searchText }));
      return dataService.getSearchData({ q: searchText });
    };

    function searchChipSync() {
      const currentQuery = vm.search.tidy($scope.query);
      vm.searchChips = vm.search.transform(currentQuery);
      vm.placeholder =
        vm.searchChips.length > 0
          ? "Expand search for layers or stories..."
          : "Search for layers or stories...";
    }

    $scope.$on("updateSelection", () => {
      searchChipSync();
    });

    searchChipSync();
  }

  /*
   * StoryTeller Autocomplete Controller
   */
  function storytellerController(
    $injector,
    $scope,
    chipFieldFactory,
    dataService
  ) {
    const vm = this;
    vm.author = new chipFieldFactory("owner__username__in", "username");
    vm.async = function(searchText) {
      console.log(dataService.getOwners({ q: searchText }));
      return dataService.getOwners({ q: searchText });
    };

    function authorChipSync() {
      const currentQuery = vm.author.tidy($scope.query);
      vm.userChips = vm.author.transform(currentQuery);
      vm.placeholder =
        vm.userChips.length > 0
          ? "Expand your StoryTeller Filter..."
          : "Filter by StoryTeller...";
    }

    $scope.$on("updateSelection", () => {
      authorChipSync();
    });

    authorChipSync();
  }
  /*
   * Country Autocomplete Controller (TODO: need to update to async with code+name query)
   */

  function countriesController(
    $injector,
    $scope,
    chipFieldFactory,
    dataService
  ) {
    const vm = this;
    vm.country = new chipFieldFactory("country");

    function querySearch(query) {
      const list = this.list;
      const results = query ? list.filter(createFilter(query)) : [];
      return results;
    }

    function createFilter(query) {
      const lowercaseQuery = query.toLowerCase();
      return function filterFn(entry) {
        return _.some(entry._lower, i => i.indexOf(lowercaseQuery) > -1);
      };
    }
    vm.country.querySearch = querySearch;
    vm.country.createFilter = createFilter;
    vm.countryChips = [];

    vm.country.transform = function() {
      // tidy any country filters on scope into a single array
      const currentQuery = vm.country.tidy($scope.query);

      // transforms each query entry into country chip
      return _.map(currentQuery, item => vm.country.byCodes[item]) || [];
    };

    // / get the things, sync chips with query on delete ///

    $scope.$on("updateSelection", () => {
      countryChipSync();
    });

    if (!$scope.autocomplete.countries) {
      // if explore controller doesn't have list of regions / countries yet,
      // get it from Region API
      dataService.getRegions().then(data => {
        setAutocomplete(data);
      });
    } else {
      // else initialize autocomplete with list from explore controller
      setAutocomplete($scope.autocomplete.countries);
    }

    function setAutocomplete(info) {
      // store response in exploreController scope
      $scope.autocomplete.countries = info;
      // extend chipField object w/ list of regions and an index by country code
      vm.country.byCodes = info.byCodes;
      vm.country.list = info.all;
      // update countryChips model
      countryChipSync();
    }

    function countryChipSync() {
      // updates countryChips model with tidy, transformed list of actively selected countries
      if (vm.country.byCodes) vm.countryChips = vm.country.transform();

      vm.disabled = vm.countryChips.length >= 1;
    }
  }
})();
