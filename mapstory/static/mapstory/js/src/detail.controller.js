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