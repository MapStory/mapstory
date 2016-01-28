'use strict';

(function() {
    angular.module('mapstory', [ 'mapstory.uploader', 'ui.bootstrap', 'geonode_main_search', 'leaflet-directive'], function($locationProvider) {
         if (window.navigator.userAgent.indexOf("MSIE") == -1){
          $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          });

          // make sure that angular doesn't intercept the page links
          angular.element("a").prop("target", "_self");
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
        'https://mapstory-static.s3.amazonaws.com/**']);
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
                         {"name": "geometry",
                             "binding": "com.vividsolutions.jts.geom.Point",
                             "minOccurs": 0,
                             "nillable": true
                         },
                         {name: 'time',
                             binding: 'org.geotools.data.postgis.PostGISDialect$XDate',
                             nillable: true,
                             minOccurs: 0
                         }
                     ]
                 },
                 nativeCRS: 'EPSG:4326',
                 srs: 'EPSG:4326',
                 store: {name: 'mapstory_data'},
                 namespace: {'name': 'geonode'}
                }
            };

     $scope.defaultAttribute = {'name':'', 'binding':'', nillable: true, minOccurs: 0};
     $scope.geometryTypes = [
         {'label': 'Point', 'value': 'com.vividsolutions.jts.geom.Point'},
         {'label': 'Line', 'value': 'com.vividsolutions.jts.geom.Line'},
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
         {'label': 'Date', 'value': 'org.geotools.data.postgis.PostGISDialect$XDate'},
     ];

     $scope.createLayer = function() {
        $scope.processing = true;
        $scope.errors = [];
        $http.post('/layers/create', {'featureType': $scope.layer.configuration_options}).then(function(response){
            $scope.processing = false;
            $scope.success = true;
            $scope.created_layers = response['data']['layers'];
        }, function(response){
            $scope.processing = false;
            $scope.errors = response['data']['errors'];
        })
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

.controller('search_controller', function($injector, $scope, $location, $http){
    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);

    $scope.search = function() {
      $scope.query.limit = 100;
      $scope.query.offset = 0;
      return query_api($scope.query).then(function(result) {
        return result;
      });
    };

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}}).success(function(data){
        $scope.results = data.objects;
        $scope.total_counts = data.meta.total_count;
        $scope.$root.query_data = data;
        if (HAYSTACK_SEARCH) {
          if ($location.search().hasOwnProperty('q')){
            $scope.text_query = $location.search()['q'].replace(/\W+/g," ");
          }
          if ($location.search().hasOwnProperty('type__in')){
            $scope.type__in = $location.search()['type__in'].replace(/\W+/g," ");;
          }
        } else {
          if ($location.search().hasOwnProperty('title__icontains')){
            $scope.text_query = $location.search()['title__icontains'].replace(/\W+/g," ");
          }
        }

        //Update facet/keyword/category counts from search results
        if (HAYSTACK_FACET_COUNTS){
            module.haystack_facets($http, $scope.$root, $location);
            $("#types").find("a").each(function(){
                if ($(this)[0].id in data.meta.facets.subtype) {
                    $(this).find("span").text(data.meta.facets.subtype[$(this)[0].id]);
                }
                else if ($(this)[0].id in data.meta.facets.type) {
                    $(this).find("span").text(data.meta.facets.type[$(this)[0].id]);
                } else {
                    $(this).find("span").text("0");
                }
            });
        }

        // Initialize carousel display
        $scope.display = [];
        $scope.indeces = [];
        for (var i = 0; i < $scope.results.length; i++) {
            $scope.display[i] = $scope.results[i];
            $scope.indeces[i] = i;
            if (i >= 3) {
                break;
            }
        }
      });
    };

    $scope.query['is_published'] = true;
    $scope.query['featured'] = true;
    query_api($scope.query);

    $scope.query_category = function(category, type) {
      $scope.query.type__in = type;
      $scope.query.category__identifier__in = category;
      $scope.search();
    };

    // carousel
    $scope.slideLeft = function() {
        for (var i = 0; i < $scope.indeces.length; i++) {
            $scope.indeces[i] = ($scope.indeces[i] + 1) % $scope.results.length;
        }
        $scope.updateDisplay();
    };

    $scope.slideRight = function() {
        for (var i = 0; i < $scope.indeces.length; i++) {
            $scope.indeces[i] = ($scope.indeces[i] - 1 + $scope.results.length) % $scope.results.length;
        }
        $scope.updateDisplay();
    };

    $scope.updateDisplay = function() {
        for (var i = 0; i < $scope.indeces.length; i++) {
            $scope.display[i] = $scope.results[$scope.indeces[i]];
        };
      }
    })

// this is from geonode it is at least used on the search page.
.controller('leaflet_hack', function($scope, leafletData) {
    $('#regions').on('shown.bs.collapse', function() {
        leafletData.getMap().then(function(map) {
            map.invalidateSize();
        });
    });
  })

.controller('profile_search_controller', function($injector, $scope, $location, $http, Configs,
                                                          UploadedData, $rootScope){
    $scope.query = $location.search();
    $scope.query.limit = $scope.query.limit || CLIENT_RESULTS_LIMIT;
    $scope.query.offset = $scope.query.offset || 0;
    $scope.page = Math.round(($scope.query.offset / $scope.query.limit) + 1);
    $scope.uploads = [];
    $scope.loading = true;
    $scope.currentPage = 0;
    $scope.offset = 0;
    $scope.limit = 10;

    $scope.init = function(user) {
      getUploads({offset: $scope.offset, limit: $scope.limit, user__username: user});
    };

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

    $scope.search = function() {
      $scope.query.limit = 100;
      $scope.query.offset = 0;
      return query_api($scope.query).then(function(result) {
        return result;
      });
    };

    // Here we want to grab the number of layers and number of maps
    // query={q: query.q}; query.type__in='map'; search();
    $scope.calculate_maps_layers = function() {
      $scope.query.type__in = 'layer';
      $scope.query.owner__username__in = Configs.url.split("?owner__username__in=").pop();
      $scope.search().then(function(result) {
        $scope.total_layers = $scope.total_counts;
        $scope.query.type__in = 'map';
        $scope.search().then(function(result) {
          $scope.total_maps = $scope.total_counts;
          //$scope.query.type__in = null;
          //$scope.query.owner__username__in = null;
        });
      });
    };

    $scope.calculate_maps_layers();

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

    //Get data from apis and make them available to the page
    function query_api(data){
      return $http.get('/api/base/search/', {params: data || {}}).success(function(data){
        $scope.results = data.objects;
        $scope.total_counts = data.meta.total_count;
        $scope.$root.query_data = data;
        if (HAYSTACK_SEARCH) {
          if ($location.search().hasOwnProperty('q')){
            $scope.text_query = $location.search()['q'].replace(/\W+/g," ");
          }
          if ($location.search().hasOwnProperty('type__in')){
            $scope.type__in = $location.search()['type__in'].replace(/\W+/g," ");;
          }
        } else {
          if ($location.search().hasOwnProperty('title__icontains')){
            $scope.text_query = $location.search()['title__icontains'].replace(/\W+/g," ");
          }
        }

        //Update facet/keyword/category counts from search results
        if (HAYSTACK_FACET_COUNTS){
            module.haystack_facets($http, $scope.$root, $location);
            $("#types").find("a").each(function(){
                if ($(this)[0].id in data.meta.facets.subtype) {
                    $(this).find("span").text(data.meta.facets.subtype[$(this)[0].id]);
                }
                else if ($(this)[0].id in data.meta.facets.type) {
                    $(this).find("span").text(data.meta.facets.type[$(this)[0].id]);
                } else {
                    $(this).find("span").text("0");
                }
            });
        }
      });
    };
  })

// add filter to decode uri
.filter('decodeURIComponent', function() {
return window.decodeURIComponent;
});

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['mapstory']);
    });
})();