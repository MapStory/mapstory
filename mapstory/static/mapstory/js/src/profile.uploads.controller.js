(function() {
  'use strict';

  angular
    .module('mapstory')
    .controller('uploadsController', uploadsController);

  function uploadsController($injector, $scope, UploadedData, $rootScope) { 
    var vm = this;
    var offset = 0;

    vm.currentPage = 0;
    vm.limit = 10;
    vm.loading = true;
    vm.uploads = [];
    
    var query = {
      offset: offset, 
      limit: vm.limit, 
      user__username: USER
    };

    getUploads(query);

    vm.pageChanged = function() {
      query.offset = (vm.currentPage - 1) * vm.limit;
      getUploads(query);
    };

    function getUploads(query) {
      UploadedData.query(query).$promise.then(function(data) {
        vm.loading = false;
        vm.uploads = data.objects;
        
        //send counts to parent scope for tab display
        $scope.counts.uploads = data.meta.total_count;

        // showing x - y of z uploads
        vm.startIndex = query.offset + 1;
        vm.endIndex = query.offset + vm.uploads.length;
      });
    }

    // if a user uploads a layer while on their profile page, 
    // this will update the list without having to refresh the page
    $rootScope.$on('upload:complete', function(event, args) {
        if (args.hasOwnProperty('id')) {
            getUploads(query);
        }
    });
  };
})();