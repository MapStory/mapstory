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