describe('Search Data Service', function() {

  var dataservice;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    dataservice = $injector.get('dataservice');
  }));

  it('should exist', function () {
    should.exist(dataservice);
  });

	describe('Get Keywords', function () {
	  it('should have a getKeywords property', function () {
	    should.exist(dataservice.getKeywords);
	  });

	   it('should have a getKeywords function', function () {
	 		expect(dataservice.getKeywords).to.be.a('function');
		});
	});

});