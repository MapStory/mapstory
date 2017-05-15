/**
 * MapStory Module
 */

(function() {
	'use strict';

	angular.module('mapstory', [
    //osgeo-importer
    'osgeoImporter.uploader',
    'ui.bootstrap',
    //maspstory
    'mapstory.search',
    'slick'
  ], function($locationProvider) {
    if (window.navigator.userAgent.indexOf("MSIE") == -1){
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      // make sure that angular doesn't intercept the page links
      angular.element("a").prop("target", "_self");
      // hack to catch new tabs
      angular.element(document.getElementsByClassName("new-tab")).prop("target", "_blank");
    }
  })

	.config(function($httpProvider, $sceDelegateProvider) {
    // this makes request.is_ajax() == True in Django
    $httpProvider.defaults.headers.post["X-Requested-With"] = 'XMLHttpRequest';

    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://mapstory-static.s3.amazonaws.com/**',
    'https://mapstory-static.s3.amazonaws.com/**',
    'http://mapstory-demo-static.s3.amazonaws.com/**',
    'https://mapstory-demo-static.s3.amazonaws.com/**']);
    })

	.constant('Configs', {
	  url: SEARCH_URL
	})

	// add filter to decode uri
	.filter('decodeURIComponent', function() {
		return window.decodeURIComponent;
	});

	angular.element(document).ready(function() {
    angular.bootstrap(document, ['mapstory']);
  });
})();
/*
 *  Homepage Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('carouselController', carouselController);

  function carouselController($injector, $scope, $location, $http){
    $scope.query = {
      'is_published': true,
      'featured': true,
      'limit': 80,
      'offset': 0
    };

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}}).success(function(data){
        $scope.results = $scope.display = data.objects;
      });
    };

    $scope.reset = function(){
      $scope.display = $scope.results;
    }

    $scope.filterCategory = function(categoryFilter) {
      //does not require 'type' like in main geonode search controller
      $scope.display = _.where($scope.results,{category: categoryFilter} )
    };

    query_api($scope.query);
  }
})();

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
/*
 *  CreateLayer & CreateLayerModal
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('createLayerCtrl', createLayerCtrl)
    .controller('createLayerModalCtrl', createLayerModalCtrl);

  function createLayerCtrl($scope, $uibModal) {
    $scope.open = function (templateUrl, modalImage, staticUrl) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: templateUrl || 'importWizard.html',
        controller:  'createLayerModalCtrl',
        resolve: {
          modalImage: function () {
            return modalImage;
          },
          staticUrl: function () {
            return staticUrl;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    };
  }

  function createLayerModalCtrl($scope, $modalInstance, $http, modalImage, staticUrl) {
    $scope.staticUrl = staticUrl;
    $scope.modalImage = modalImage;
    $scope.processing = false;
    $scope.layer = {
       configuration_options: {
         attributes: {
           attribute: [
             {   name: "geometry",
                 "binding": "com.vividsolutions.jts.geom.Point",
                 "minOccurs": 0,
                 "nillable": true
             },
             {   name: 'time',
                 binding: 'org.geotools.data.postgis.BigDate',
                 nillable: true,
                 minOccurs: 0
             }
           ]
         },
         nativeCRS: 'EPSG:4326',
         srs: 'EPSG:4326',
         store: {name: 'mapstory_geogig'},
         namespace: {'name': 'geonode'},
         configureTime: true
        }
      };

    $scope.defaultAttribute = {'name':'', 'binding':'', nillable: true, minOccurs: 0};
    $scope.geometryTypes = [
     {'label': 'Point', 'value': 'com.vividsolutions.jts.geom.Point'},
     {'label': 'Line', 'value': 'com.vividsolutions.jts.geom.LineString'},
     {'label': 'Polygon', 'value': 'com.vividsolutions.jts.geom.Polygon'},
     {'label': 'Geometry', 'value': 'com.vividsolutions.jts.geom.Geometry'},
     {'label': 'Multi-Point', 'value': 'com.vividsolutions.jts.geom.MultiPoint'},
     {'label': 'Multi-Line', 'value': 'com.vividsolutions.jts.geom.MultiLineString'},
     {'label': 'Multi-Polygon', 'value': 'com.vividsolutions.jts.geom.MultiPolygon'},
     {'label': 'Multi-Geometry', 'value': 'com.vividsolutions.jts.geom.MultiGeometry'}
    ];

    $scope.attributeTypes = [
     {'label': 'Text', 'value': 'java.lang.String'},
     {'label': 'Number', 'value': 'java.lang.Double'},
     {'label': 'Date', 'value': 'org.geotools.data.postgis.BigDate'},
    ];

    $scope.createLayer = function() {
      $scope.processing = true;
      $scope.errors = [];
      $scope.setDefaultPermissions($scope.layer.configuration_options.editable);
      $http.post('/layers/create', {'featureType': $scope.layer.configuration_options}).then(function(response){
        $scope.processing = false;
        $scope.success = true;
        $scope.created_layers = response['data']['layers'];
      }, function(response){
        $scope.processing = false;
        $scope.errors = response['data']['errors'];
      })
     };

    $scope.setDefaultPermissions = function(edit) {
      $scope.layer.configuration_options.permissions = {
        'users': {'AnonymousUser': ['change_layer_data', 'download_resourcebase', 'view_resourcebase']},
        'groups': {'registered': ['change_layer_data', 'download_resourcebase', 'view_resourcebase']}
      };

      if(edit === false) {
        $scope.layer.configuration_options.permissions = {
          'users': {'AnonymousUser': ['download_resourcebase', 'view_resourcebase']},
          'groups': {'registered': ['download_resourcebase', 'view_resourcebase']}
        };
       }
       $scope.layer.configuration_options.storeCreateGeogig = true;
    };

    $scope.addDefaultAttribute = function() {
      $scope.layer.configuration_options.attributes.attribute.push(angular.copy($scope.defaultAttribute));
    };

    $scope.remove = function(item) {
      var index = $scope.layer.configuration_options.attributes.attribute.indexOf(item);
      $scope.layer.configuration_options.attributes.attribute.splice(index, 1);
    };

    $scope.nameValid = function() {
      if (!$scope.layer.configuration_options.hasOwnProperty('name')) {
        return false;
      }
      return true;
    };

    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
})();
/*
 *  Story and Layer Detail Page's Controller
 */
(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('detailController', detailController);

  function detailController($scope, $http, $mdConstant){
    $scope.chips = keywords;
    $scope.readOnly = loggedIn === "True" ? false : true;
    $scope.separateOn = [
      $mdConstant.KEY_CODE.ENTER, 
      $mdConstant.KEY_CODE.COMMA, 
      $mdConstant.KEY_CODE.SEMICOLON, 
      $mdConstant.KEY_CODE.SPACE
    ];

    $scope.showShare = function(){
      $scope.sharing = $scope.sharing ? !$scope.sharing : true;
    }

    $scope.addTag = function(chip){
      $.ajax({
        url: url,
        type:'POST',
        data:{ 
          add_keyword: chip
        }
      });
    };

    $scope.removeTag = function(chip){
      $.ajax({
        url: url,
        type:'POST',
        data:{ 
          remove_keyword: chip
        }
      });
    };

    $scope.newChip = function(chip){
      return chip.toLowerCase();
    };

    $("#comment_submit_btn").click(function (event) {
      $.ajax({
        type: "POST",
        url: $("#form_post_comment").attr('action'),
        data: $("#form_post_comment").serialize(),
        success: function () {
          $('#form_post_comment_div').modal('hide');
          $('#comments_section').load(window.location.pathname + ' #comments_section',
            function () {
                $(this).children().unwrap()
            })
        }
      });
      return false;
    });
  }
})();
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
/**
 * Search Module
 */

(function() {
	'use strict';

	angular.module('mapstory.search', ['ngMaterial'], function($locationProvider) {
    if (window.navigator.userAgent.indexOf("MSIE") == -1){
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      // make sure that angular doesn't intercept the page links
      angular.element("a").prop("target", "_self");
    }
  })
	    
	.constant('Configs', {
	  url: SEARCH_URL
	})

  .run(function($http, $rootScope, $location){

    function load_active_list ($http, $rootScope, $location, api, endpoint, filter){
      var params = typeof FILTER_TYPE == 'undefined' ? {} : {'type': FILTER_TYPE};
      $http.get(endpoint, {params: params})
        .then(
          /* success */
          function(response) {
           $rootScope[api] = response.data.objects
           //used for homepage carousel and explore/content_sidebar
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
          }
        )
    }
    
    load_active_list($http, $rootScope, $location, 'categories',
          CATEGORIES_ENDPOINT,'category__identifier__in');
  })

    // add filter to decode uri
  .filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  })

})();
/*
* Cities Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('citiesController', citiesController);
  
  function citiesController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.cities = autocompleteService.cities;

    function syncDisplay(){
      if( $scope.autocomplete.cities ){  
        vm.cities.list = $scope.autocomplete.cities.all; 
        vm.cityChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.cities.tidy;
      return _.map(tidy($scope.query), function (item) {
        return {'city': item};
      }) || [];
    } 
        
    $scope.$on('loadedOwners', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();
/*
* Country Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('countriesController', countriesController);

  function countriesController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.country = autocompleteService.countries;
    
    var countriesByCodes;

    function syncDisplay(){
      if( $scope.autocomplete.countries ){
        countriesByCodes = $scope.autocomplete.countries.byCodes;
        
        vm.country.list = $scope.autocomplete.countries.all; 
        vm.countryChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.country.tidy;
      return _.map(tidy($scope.query), function (item) {
        return countriesByCodes[item]
      }) || [];
    }

    $scope.$on('loadedCountries', function(){ syncDisplay(); });
    $scope.$on('topEvent', function(){ syncDisplay(); });
  }
})();
/*
* Interests Autocomplete Controller
*/
(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('interestsController', interestsController);

  function interestsController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.interests = autocompleteService.interests;

    function syncDisplay(){
      if( $scope.lists.keywords){  
        vm.interests.list = $scope.lists.keywords.list; 
        vm.interestChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.interests.tidy;
      return _.map(tidy($scope.query), function (item) {
        return {'slug': item};
      }) || [];
    } 
        
    $scope.$on('loaded', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();
/*
* MapStory Search Autocomplete Service
* builds functions for autocompletion on each explore field
* for use with angular material chips
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('autocompleteService', autocompleteService);

  function autocompleteService($http, $location, $q) {

    var countries = new Autocompletes('country');
    var authors = new Autocompletes('owner__username__in');
    var cities = new Autocompletes('city', 'city');
    var interests = new Autocompletes('interest_list', 'slug');
    var tags = new Autocompletes('keywords__slug__in', 'slug');

    var service = {
      authors: authors,
      cities: cities,
      countries: countries, 
      interests: interests,
      tags: tags,
      _tidyQuery: tidyQuery,
    };

    return service;

    ////////////

    function newChip(key, chip) {  
      if (chip[key]){
        return chip
      }else{
        var newChip = {};
        newChip[key] = chip;
        return newChip
      }
    }

    function querySearch(query) {
      var list = this.list;
      var results = query ? list.filter(createFilter(query)) : [];
      return results;
    }

    function createFilter(query) {
      var lowercaseQuery = query.toLowerCase();    
      return function filterFn(entry) {
        return _.some(entry._lower, function(i){
            return i.indexOf(lowercaseQuery) > -1
        });
      };
    }

    function tidyQuery(filter, query) {
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function Autocompletes(filter, newChipKey) {
      this.querySearch = querySearch;
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
      
      if(newChipKey){
        this.newChip = _.partial(newChip, newChipKey);
      }    
    }
  }
})();
/*
* StoryTeller Autocomplete Controller
*/
(function() {
'use strict';
  angular
    .module('mapstory.search')
    .controller('storytellerController', storytellerController);

  function storytellerController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.author = autocompleteService.authors;
    
    var byUsername;

    function syncDisplay(){
      if( $scope.autocomplete.authors ){
        byUsername = $scope.autocomplete.authors.byUsername;
        
        vm.author.list = $scope.autocomplete.authors.all;
        vm.userChips = transformChips();
      }
    }

    function transformChips(){
      var tidy = vm.author.tidy;
      return _.map(tidy($scope.query), function (item) {
        return byUsername[item]
      }) || [];
    }

    $scope.$on('loadedOwners', function(){ syncDisplay(); });
    $scope.$on('topEvent', function(){ syncDisplay(); });
  }
})();
/*
* Tag / Keyword Autocomplete Controller
*/

(function() {
'use strict';
  angular
    .module('mapstory.search')
    .controller('tagsController', tagsController);

  function tagsController ($injector, $scope, autocompleteService){
    var vm = this;
    vm.tags = autocompleteService.tags;

    function syncDisplay(){
      if( $scope.lists.keywords){  
        vm.tags.list = $scope.lists.keywords.list; 
        vm.tagChips = transformChips();
      }
    }

    function setTopTags(tidiedTagList){
      vm.topDisplay = _.difference($scope.lists.keywords.trending, tidiedTagList);
    }

    function transformChips(){
      var tidy = vm.tags.tidy;
      var tidyTags = tidy($scope.query);

      setTopTags(tidyTags);

      return _.map(tidyTags, function (item) {
        return {'slug': item};
      }) || [];
    } 
    
    $scope.$on('loaded', function(){ syncDisplay() });
    $scope.$on('topEvent', function(){ syncDisplay() });
  }
})();
 /*
  * Data Service Factory
  */
(function() {
'use strict';

  angular
    .module('mapstory.search')
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http'];
  
  function dataservice($http, logger) {
    return {
        getKeywords: getKeywords,
        getRegions: getRegions,
        getOwners: getOwners
      }

    function getKeywords() {
        return $http.get('/api/keywords/')
            .then(getKeywordsComplete);

        function getKeywordsComplete(response) {
          var index = {};
          var list = _.map(response.data.objects, function (tag) {
            tag._lower = [tag.slug.toLowerCase()];
            index[tag.slug] = tag;
            return tag;
          });

          list = _.sortBy(list, function(tag) {
            return -tag.count;
          });

          var trending = [];

          var displayLength = (list.length > 10) ? 10 : list.length;

          for (var i = 0; i < displayLength; i++) {
            if(list[i]['count'] != 0)
              trending.push(list[i]['slug']);
          } 
          return {
            list: list,
            index: index,
            trending: trending
          } 
        }
    }

    function getRegions(){
    return $http.get('/api/regions/')
            .then(getRegionsComplete);
    
      function getRegionsComplete(response) { 
        var results = response.data.objects;
        var codes = {};

        var countryResults = _.map(results, function (region) {
            region._lower = [ region.name.toLowerCase() , region.code.toLowerCase() ];
            codes[region.code] = region;
          return region;
        });

        return {
          all: countryResults,
          byCodes: codes,
        } 
      }
    }

    function getOwners(){
      return $http.get('/api/owners/')
              .then(getOwnersComplete);
      
        function getOwnersComplete(response) {
          var profiles = { all: [], byUsername:{} };
          var cities = { all: [] };
          
          _.reduce(response.data.objects, function ( profiles, user) {
            var first = user.first_name.toLowerCase();
            var last = user.last_name.toLowerCase();
            var firstLast = first + " " + last;
            var username = user.last_name.toLowerCase();
            user._lower = [ first, last, firstLast, username ];
            
            profiles.all.push(user);
            profiles.byUsername[user.username] = user;

            if(user.city){
              var city = { city: user.city};
              city._lower = [ user.city.toLowerCase() ];
              cities.all.push(city);
            }
            
            return profiles;
          }, profiles);

          return {
            profiles: profiles,
            cities: cities
          } 
        }
    }
  };
})();
  /*
  * Explore Page Controller
  */

  (function() {
  'use strict';

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs, dataservice) {
    $scope.query = $location.search();
    $scope.sitename = SITE_NAME;
    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    $scope.orderMethod = '-popular_count';

    $scope.orderMethods = {
      content:
        [
          {name:'Popular', filter:'-popular_count'},
          {name:'Newest', filter:'-date'}
        ]
    };

    $scope.lists = {};
    $scope.autocomplete = {};

    if (!Configs.hasOwnProperty("disableQuerySync")) {
      // Keep in sync the page location with the query object
      $scope.$watch('query', function(newValue, oldValue){
        $location.search($scope.query);
        $scope.$broadcast('topEvent');
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
            $scope.startnumresults = Number($scope.query.offset) + 1;
            $scope.numresults = Number($scope.query.offset) + Number($scope.results.length);
          },
          /* failure */
          function(error) {
            console.log("The request failed: ", error);
          }
        )
    };

    $scope.clearVTC= function(){
      $scope.VTCisChecked = false;
      $scope.filterVTC();
      $scope.search();
    }

    $scope.filterVTC = function() {
      // When VTC check box is clicked, also filter by VTC; when unchecked, reset it
      if ($scope.VTCisChecked == true) {
        $scope.itemFilter['Volunteer_Technical_Community'] = true;
      } else {
        $scope.itemFilter = { is_active: true };
      }
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
      $scope.clearVTC()
     // $scope.search();
    };
    // Make the user one active, content inactive
    $scope.toContentSearch = function() {
      $scope.apiEndpoint = '/api/base/search/';
      $scope.query = { content: true, is_published: true, limit: CLIENT_RESULTS_LIMIT, offset: 0 };
  
      $scope.search();
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

    //Checkbox selection syncing with query
    $scope.isActivated = function (item, list, filter) {
      if(list[filter]){
        return list[filter].indexOf(item) > -1;
      } 
    };

    // Allow the user to choose an order method using the What's Hot section.
    $scope.orderMethodUpdate = function(orderMethod) {
      $scope.orderMethod = orderMethod;
    };

    $scope.clear = function(filter){
      delete($scope.query[filter]);
      $scope.search();
    };

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

  //// get the things

    var getKeywords = _.once(dataservice.getKeywords);
    var getRegions = _.once(dataservice.getRegions);
    var getOwners = _.once(dataservice.getOwners);

    getOwners().then(function(data) {
      $scope.autocomplete['authors'] = data.profiles;
      $scope.autocomplete['cities'] = data.cities;
      $scope.$broadcast('loadedOwners')
    });

    getRegions().then(function(data) {
      $scope.autocomplete['countries'] = data;
      $scope.$broadcast('loadedCountries')
    });

    getKeywords().then(function(data) {
      $scope.lists['keywords'] = data;
      $scope.$broadcast('loaded');
    });

    $scope.filterVTC();
    $scope.search();
  }
})();