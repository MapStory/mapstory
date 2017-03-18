/**
 * MapStory Module
 */

(function() {
	'use strict';

	angular.module('mapstory', [
    'osgeoImporter.uploader',
    'ui.bootstrap',
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
	    
	// enables angular access to select django values (passed in _site_scripts.html)
	.factory('Django', function(DjangoConstants) {
	  return {
	    get: function(key) {
	      return DjangoConstants[key];
	    },
	    all: function() {
	      return DjangoConstants;
	    }
	  };
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
      'limit': 80
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

        var MAX_TOKENS = 10;
        $('#tokenfield-interests').val(keywords_list);
        $('#tokenfield-interests').tokenfield({
          limit: MAX_TOKENS
        });
        $('#tokenfield-interests').tokenfield('readonly');
        $('.token-label').click(function(e) {
          var tag = $(e.target).text();
          window.location.href = '/search/?limit=100&offset=0&keywords__slug__in=' + tag;
        });
      });
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

  function detailController($scope, $http){

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

    $scope.showShare = function(){
      $scope.sharing = $scope.sharing ? !$scope.sharing : true;
    }

    $scope.tags = keywords;

    var updatePlaceholder = function(){
      var textField = $('#tokenfield-tags-tokenfield');

      if ($scope.tags.length > 0){
        textField.prop('placeholder', '');
      }else{
        textField.prop('placeholder', 'Type here to add tags...');
      }
    }

    // Manually set the value field
    var value = $('#tokenfield-tags').val($scope.tags);
    // Only initialize the tokenfield once the values are set
    if (value) {
      $('#tokenfield-tags').tokenfield()
      .on('tokenfield:createtoken', function(e) {
        var data = e.attrs.value.split(' ');
        // Create token for first word
        e.attrs.value = data[0];
        e.attrs.label = data[0];
        // Create tokens for remaining words, if any, separated by spaces
        for (var i = 1; i < data.length; i++) {
          $('#tokenfield-tags').tokenfield('createToken', data[i]);
        }
      })
      .on('tokenfield:createdtoken', function(e) {
        if ($scope.tags.indexOf(e.attrs.value) == -1) {
          $scope.tags.push(e.attrs.value);
          updatePlaceholder();

          $.ajax({
            url: url,
            type:'POST',
            data:{ 
              add_keyword: e.attrs.value.toLowerCase()
            }
          });
        }
      })
      .on('tokenfield:removedtoken', function(e) {
        var index = $scope.tags.indexOf(e.attrs.value);
        if (index > -1) {
          $scope.tags.splice(index, 1);
          updatePlaceholder();

          $.ajax({
            url: url,
            type:'POST',
            data: {
              remove_keyword: e.attrs.value
            }
          });
        }
      });

      //After initializing token field adjust placeholder text
      updatePlaceholder();
    }
    // Manually set the value field
    var value_ro = $('#tokenfield-tags-readonly').val($scope.tags);
    if (value_ro) {
      $('#tokenfield-tags-readonly').tokenfield();
      $('#tokenfield-tags-readonly').tokenfield('readonly');
    }
    // If a label is clicked, do a manual redirect to the explore page with the value of the token as the keyword search filter
    $('.token-label').click(function(e) {
      var tag = $(e.target).text();
      window.location.href = '/search/?limit=100&offset=0&keywords__slug__in=' + tag;
    });
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
      $http.get(endpoint, {params: params}).success(function(data){
        //sets an active property if category already selected in a url query
        
        $rootScope[api]= data.objects;
      });
    }
    
    load_active_list($http, $rootScope, $location, 'categories',
          CATEGORIES_ENDPOINT,'category__identifier__in');
  })

  .filter('activated', function (){
    return function(value, property, query){

      //console.log(query);
      if(_.has(query,property)){
        return _.contains(query[property], value) || query[property] == value;
      }else{
        return false;
      }
    }
  })
    // add filter to decode uri
  .filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
  })

})();
/*
* 
*/

(function() {
'use strict';

  angular
    .module('mapstory.search')
    .service('autocomplete', autocomplete);

  function autocomplete($http, $location, $q) {

    var countries = new Autocompletes('countries', 'api/regions', 'country');
    var authors = new Autocompletes('storyteller', 'api/owners', 'owner__username__in');
    var cities = new Autocompletes('cities', 'api/owners', 'city');
    var interests = new Autocompletes('interests', 'api/keywords', 'interest_list');
    var tags = new Autocompletes('tags', 'api/keywords', 'keywords__slug__in');

    var service = {
      authors: authors,
      cities: cities,
      countries: countries, 
      interests: interests,
      tags: tags,
    };

    return service;

    ////////////

    function querySearch(query){
      var list = this.list;
      var results = query ? list.filter(createFilter(query)) : [];
            return results;
    }

    function createFilter(query) {
      var lowercaseQuery = angular.lowercase(query);    
      return function filterFn(entry) {
        return _.some(entry._lower, function(i){
            return i.indexOf(lowercaseQuery) > -1
        });
      };
    }

    function tidyQuery(filter, query){
      return typeof(query[filter]) == 'string' ? [query[filter]] : query[filter];
    }

    function Autocompletes(type, api, filter){
      this.type = type;
      this.api = api;
      this.querySearch = querySearch;
      this.list = []; 
      this.tidy = _.partial(tidyQuery, filter);
    }
  }
})();
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
        var index = {};
        var list = _.map(response.data.objects, function (region) {
            region._lower = [ region.name.toLowerCase() , region.code.toLowerCase() ];
            index[region.code] = region;
          return region;
        });

        return {
          list: list,
          index: index,
        } 
      }
    }

    function getOwners(){
      return $http.get('/api/owners/')
              .then(getOwnersComplete);
      
        function getOwnersComplete(response) {
          var profiles = { list: [], index:{} };
          var cities = { list: [] };
          
          _.reduce(response.data.objects, function ( profile, user) {
            user._lower = [ user.first_name.toLowerCase(), user.last_name.toLowerCase(), user.username.toLowerCase() ];
            profiles.list.push(user);
            profiles.index[user.username] = user;

            if(user.city){
              var city = { city: user.city};
              city._lower = [ user.city.toLowerCase() ];
              cities.list.push(city);
            }
            
            return profile;
          });

          return {
            profiles: profiles,
            cities: cities
          } 
        }
    }
  };
})();
  /*
  * 
  */

  (function() {
  'use strict';

  angular
    .module('mapstory.search')
    .controller('exploreController', exploreController);

  function exploreController($injector, $scope, $location, $http, $q, Configs, dataservice, autocomplete) {
    $scope.query = $location.search();
    $scope.sitename = SITE_NAME;
    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    $scope.orderMethod = '-popular_count';

    $scope.lists = {};

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

      return $http.get($scope.apiEndpoint, {params: data || {}}).success(function(data){
        $scope.results = data.objects;
        $scope.total_counts = data.meta.total_count;
        $scope.startnumresults = Number($scope.query.offset) + 1;
        $scope.numresults = Number($scope.query.offset) + Number($scope.results.length);
        
      });
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
      $scope.lists['profiles'] = data.profiles;
      $scope.lists['cities'] = data.cities;
      $scope.$broadcast('loadedOwners')
    });

    getRegions().then(function(data) {
      $scope.lists['countries'] = data;
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
/*
* 
*/

(function() {
'use strict';
  angular
      .module('mapstory.search')
      .controller('countriesController', countriesController)
      .controller('citiesController', citiesController)
      .controller('storytellerController', storytellerController)
      .controller('tagsController', tagsController)
      .controller('interestsController', interestsController);

  function countriesController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.countries;
      
    $scope.$on('loadedCountries', function(){
      if( $scope.lists.countries ){
        vm.auto.list = $scope.lists.countries.list;
        vm.index = $scope.lists.countries.index;
        vm.selectedCountries = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.countries ){
        vm.selectedCountries = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    });
  }

  function storytellerController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.authors;
    
    $scope.$on('loadedOwners', function(){
      if( $scope.lists.profiles ){
        vm.auto.list = $scope.lists.profiles.list;
        vm.index = $scope.lists.profiles.index;
        vm.selectedUsers = _.map(vm.auto.tidy($scope.query), function (item) {
          return vm.index[item];
        }) || [];
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.profiles ){
        vm.selectedUsers = _.map(vm.auto.tidy($scope.query), function (user) {
          return vm.index[user];
        }) || [];
      }
    });
  }

  function citiesController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.cities;


    vm.newCity = function(chip) {
      return chip.city ? chip : {city: chip};
    };

   vm.selectedCities = _.map(vm.auto.tidy($scope.query), function (item) {
      return {city: item};
    }) || [];
      
    $scope.$on('loadedOwners', function(){
      if( $scope.lists.cities ){
        vm.auto.list = $scope.lists.cities.list;
      }
    })

    $scope.$on('topEvent', function(){
      if( $scope.lists.cities ){
        vm.selectedCities = _.map(vm.auto.tidy($scope.query), function (item) {
          return {city: item};
        }) || [];
      }
    });
  }

  function interestsController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.interests;
    
    vm.selectedInterests = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];

    vm.newInterest = function(chip) {
      return chip.slug ? chip : {slug: chip};
    };

    $scope.$on('loaded', function(){
      if($scope.lists.keywords)
        vm.auto.list = $scope.lists.keywords.list;
    })

    $scope.$on('topEvent', function(){
      vm.selectedInterests = _.map(vm.auto.tidy($scope.query), function (item) {
          return {slug: item};
        }) || [];
    });
  }

  function tagsController ($injector, $scope, autocomplete){
    var vm = this;
    vm.auto = autocomplete.tags;

    vm.selectedTags = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];

    vm.newTag = function(chip) {
      return chip.slug ? chip : {slug: chip};
    };

    $scope.$on('loaded', function(){
      if($scope.lists.keywords){
        vm.auto.list = $scope.lists.keywords.list;
        vm.trending = $scope.lists.keywords.trending
        setTopTags();
      }
    })
    
    $scope.$on('topEvent', function(){
      vm.selectedTags = _.map(vm.auto.tidy($scope.query), function (item) {
            return {slug: item};
          }) || [];
      setTopTags();
    });
    
    function setTopTags(){
      vm.topDisplay = _.difference($scope.lists.keywords.trending, vm.auto.tidy($scope.query))
    }
  }
})();