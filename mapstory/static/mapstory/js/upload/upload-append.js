
$(function() {
  var app = angular.module('layerUpload', ['ngCookies']);

  app.controller('appendController', function ($scope, $http, $q, $cookies) {
    $scope.layerSourceSelector = '';
    $scope.layerDestinationSelector = '';
    $scope.isLoading = false;

    $scope.showButtons = function () {
      return ($scope.layerSourceSelector && $scope.layerSourceSelector);
    };

    $scope.append = function () {
      var params = {
        'layerDestination': $scope.layerDestinationSelector,
        'layerSource': $scope.layerSourceSelector
      };
      // server hasn't been added yet, so specify the auth headers here
      $http({
        method: 'POST',
        url: '/layers/append',
        data: $.param(params),
        headers: {
          'Content-Type': "application/x-www-form-urlencoded",
          'X-CSRFToken': $cookies.csrftoken
        }
      }).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            var totalInserted = 0;
            console.log('----[ response: ', response.statusText);
            var docXML = $.parseXML(response.data);
            $(docXML).find('totalInserted').each(function () {
              var insertedNum = parseInt($(this).text());
              if (isNaN(insertedNum) === false) {
                totalInserted += insertedNum;
              }
            });
            console.log('totalInserted: ', totalInserted);

            var template = _.template($('#alertTemplate').html());
            $('#status').html(template({
              alertLevel: 'alert-success',
              message: _.template($('#completedTemplate').html())({
                totalInserted: totalInserted,
                urlLayerInfo: '/layers/' + params.layerDestination
              })
            }));

          } else {
            window.alert("There was a problem retrieving the layers from the server. Please make sure you're logged into GeoShape.")
          }
          $scope.isLoading = false;
        }, function (response) {
          $scope.isLoading = false;
          msg = gettext('Error: ') + response.statusText;
          if (response.data) {
            msg += ', ' + response.data;
          }
          var template = _.template($('#alertTemplate').html());
          $('#status').html(template({
            alertLevel: 'alert-danger',
            message: '<p>' + msg +  '</p>'
          }));
        });
    };
  });
}());