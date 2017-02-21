'use strict';

(function() {
    angular.module('mapstory', [
        'osgeoImporter.uploader',
        'ui.bootstrap',
        'mapstorySearch',
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

.controller('createLayerCtrl', function($scope, $uibModal) {
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
})

.controller('createLayerModalCtrl', function($scope, $modalInstance, $http, modalImage, staticUrl) {
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
})

.controller('featured_carousel', function($injector, $scope, $http){
  $scope.query = {};
  $scope.query['is_published'] = true;
  $scope.query['featured'] = true;

  $scope.query.limit = 80;

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
})

.controller('profile_search_controller', function($injector, $scope, $location, $http, Configs, Django,
                                                          UploadedData, $rootScope){
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
})

.controller('collection_controller', function($http, $scope) {
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
})

.controller('detail_page_controller', function($scope, $http){

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
})


// add filter to decode uri
.filter('decodeURIComponent', function() {
return window.decodeURIComponent;
});

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['mapstory']);
    });
})();