// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: [ 'mocha', 'chai'],
    reporters: ["spec"],
    singleRun: true,
    browsers: ['PhantomJS'],
    files: [
      // angular source
      'vendor/jquery/dist/jquery.min.js',
      'vendor/angular/angular.js',
      'vendor/angular-animate/angular-animate.min.js',
      'vendor/angular-aria/angular-aria.min.js',
      'vendor/angular-material/angular-material.js',
      'vendor/angular-mocks/angular-mocks.js',

      //
      'vendor/underscore/underscore-min.js',
      
      // jerry-rigged importer source, have to create directory manually
      'vendor/osgeo_importer/js/angular-resource.js',
      'vendor/osgeo_importer/js/underscore-min.js',
      'vendor/osgeo_importer/js/ui-bootstrap-tpls-0.14.2.min.js',
      'vendor/osgeo_importer/js/angular-cookies.js',
      'vendor/osgeo_importer/js/angular-wizard.min.js',
      'vendor/osgeo_importer/js/factories.js',
      'vendor/osgeo_importer/js/angular-file-upload.min.js',
      'vendor/osgeo_importer/js/importer.js',

      // our django site variables
      'mapstory/js/spec/django-context.js',
      // mock response from geonode APIs
      'mapstory/js/spec/mockRegionsAPI.js',
      
      // our app code
      'mapstory/js/dist/mapstory.js',
      // our spec files
      'mapstory/js/**/*.spec.js',
    ]
  });
};