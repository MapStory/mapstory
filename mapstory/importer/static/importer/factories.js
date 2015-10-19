'use strict';

(function() {
    angular.module('mapstory.factories', ['ngResource'])

    .factory('UploadedData', function ($resource) {
        return $resource('/importer-api/data/:id/', {}, {'query': {
            method: 'GET',
            isArray: false,
            transformResponse: function (jsondata) {
                return JSON.parse(jsondata);
            }
            },
                update: {method: 'PUT'}
        })
    })

    //.factory('UploadedLayers', function ($resource) {
    //    return $resource('/importer-api/data/:id/', {}, {'query': {'method': 'GET', isArray: false}});
    //})

    //.factory('Staffing', function ($resource) {
    //    return $resource('/api/v1/staffing/:id/', {},
    //        {query: { method: 'GET', isArray: true,
    //            transformResponse: function (jsondata) {
    //                return JSON.parse(jsondata).objects;
    //            }
    //        },
    //            update: {method: 'PUT'}
    //        });
    //})
})();