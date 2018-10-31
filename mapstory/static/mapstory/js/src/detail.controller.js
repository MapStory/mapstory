/*
 *  Story and Layer Detail Page's Controller
 */
(() => {
  function detailController($scope, $http, $mdConstant) {
    $scope.chips = window.keywords;
    $scope.readOnly = window.loggedIn !== "True";
    $scope.separateOn = [
      $mdConstant.KEY_CODE.ENTER,
      $mdConstant.KEY_CODE.COMMA,
      $mdConstant.KEY_CODE.SEMICOLON,
      $mdConstant.KEY_CODE.SPACE
    ];

    $scope.showShare = () => {
      $scope.sharing = $scope.sharing ? !$scope.sharing : true;
    };

    $scope.addTag = chip => {
      $.ajax({
        url: window.url,
        type: "POST",
        data: {
          add_keyword: chip
        }
      });
    };

    $scope.removeTag = chip => {
      $.ajax({
        url,
        type: "POST",
        data: {
          removedKeyword: chip
        }
      });
    };

    $scope.newChip = chip => chip.toLowerCase();

    $("#comment_submit_btn").click(event => {
      $.ajax({
        type: "POST",
        url: $("#form_post_comment").attr("action"),
        data: $("#form_post_comment").serialize(),
        success() {
          $("#form_post_comment_div").modal("hide");
          $("#comments_section").load(
            `${window.location.pathname} #comments_section`,
            () => {
              $(this)
                .children()
                .unwrap();
            }
          );
        }
      });
      return false;
    });
  }
  angular.module("mapstory").controller("detailController", detailController);
})();
