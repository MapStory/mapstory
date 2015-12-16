describe('Importer', function() {

  // You need to load modules that you want to test,
  // it loads only the "ng" module by default.
  beforeEach(module('mapstory.uploader'));


  // inject() is used to inject arguments of all given functions
  it('should provide a version', inject(function($compile, $rootScope) {
       var myElement = $compile('<div class="upload"></div>')($rootScope);
      $rootScope.$digest();
       console.log(myElement);
       expect(myElement.isolateScope().showImportOptions).toBe(true);
  }));



  it('should have custom interpolation symbols', inject(function($interpolate) {
      expect($interpolate.startSymbol()).toBe('{[');
      expect($interpolate.endSymbol()).toBe(']}');
  }));

  it('use django specific csrf cookie names', inject(function($http) {
      expect($http.defaults.xsrfCookieName).toBe('csrftoken');
  }));

  it('use django specific csrf header names', inject(function($http) {
      expect($http.defaults.xsrfHeaderName).toBe('X-CSRFToken');
  }));

});
