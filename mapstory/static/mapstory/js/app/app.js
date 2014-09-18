(function() {
  var module = angular.module('ngBoilerplate', [
    'templates-app',
    'templates-common',
    'loom',
    'ui.bootstrap',
    'ui.router',
    'pascalprecht.translate',
    'loom_translations_en',
    'loom_translations_es',
    'xeditable'
  ]);

  var toolModes = {
    "#ms-toggle-layers" : {
        show: '#pulldown'
    },
    "#ms-toggle-board" : {
        show: '#ms-story-board'
    },
    "#ms-toggle-pins" : {
        show: '#ms-story-pins'
    },
    "#ms-toggle-preview" : {
        show: '#ms-story-preview'
    }
  };

  module.run(function run(editableOptions) {
    editableOptions.theme = 'bs3';
  });

  module.controller('AppCtrl', function AppCtrl($scope, $window, $location, $translate, mapService, debugService,
                                                refreshService, dialogService) {
        $scope.$on('$stateChangeSuccess', function(event, toState) {
          if (angular.isDefined(toState.data.pageTitle)) {
            $scope.pageTitle = toState.data.pageTitle;
          }
        });

        $('body').on('show.bs.modal', function(e) {
          var modals = $('.modal.in');
          var backdrops = $('.modal-backdrop');
          for (var i = 0; i < modals.length; i++) {
            modals.eq(i).css('z-index', 760 - (modals.length - i) * 20);
            backdrops.eq(i).css('z-index', 750 - (modals.length - i) * 20);
          }
          $(e.target).css('z-index', 760);
        });

        var errorDialogShowing = false;
        onErrorCallback = function(msg) {
          if (goog.isDefAndNotNull(ignoreNextScriptError) && ignoreNextScriptError &&
              msg.indexOf('Script error') > -1) {
            ignoreNextScriptError = false;
            return;
          }
          if (errorDialogShowing) {
            return;
          }
          errorDialogShowing = true;
          dialogService.error($translate('error'), $translate('script_error', {error: msg})).then(function() {
            errorDialogShowing = false;
          });
        };

        // Enable Proj4JS
        ol.HAVE_PROJ4JS = ol.ENABLE_PROJ4JS && typeof Proj4js == 'object';

        $scope.mapService = mapService;
        $scope.refreshService = refreshService;

        // @todo - provisional control over 'modes' - look at `toolModes`, too
        $("#ms-tl-nav li a").click(function(ev) {
          var href = $(this).attr('href');
          if (href.charAt(0) === '#') {
              ev.preventDefault();
              var activeMode = toolModes[href];
              for (var modeName in toolModes) {
                  if (modeName === activeMode) {
                      continue;
                  }
                  var mode = toolModes[modeName];
                  $(mode.show).fadeOut();
              }
              $(activeMode.show).show();
          }
        });
  });

  module.provider('debugService', function() {
    this.$get = function() {
      return this;
    };

    this.showDebugButtons = false;
  });

  module.provider('$exceptionHandler', function() {
    this.$get = function(errorLogService) {
      return errorLogService;
    };
  });

  module.factory('errorLogService', function($log, $window) {
    function log(exception, cause) {
      $log.error.apply($log, arguments);
      onErrorCallback(exception.toString());
    }
    // Return the logging function.
    return log;
  });

  module.config(function($translateProvider) {
    $translateProvider.preferredLanguage('en');
  });
}());

