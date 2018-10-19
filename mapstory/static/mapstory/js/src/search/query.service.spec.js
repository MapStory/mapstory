describe('Query Validation Service', function() {

  var queryService;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    queryService = $injector.get('queryService');
  }));

  it('should exist', function () {
    should.exist(queryService);
  });

  it('should should be an object with these methods', function () {
    expect(queryService.roundOffset).to.be.a('function');
    expect(queryService.resetOffset).to.be.a('function');
  });

	xdescribe('resetOffset', function() {
  	var scope;

    beforeEach(function(){
      
    });

  	it('should reset the offset to 0', function(){
  		
  	});

  	it('should search again after reseting the offset', function(){
  		
  	});

	});

  describe('roundOffset', function() {
  	var scope1 = {};
  	var scope2 = {};

    beforeEach(function(){
      scope1.query = {
      	limit: 30,
      	offset: 122
      };

      scope2.query = {
      	limit: 3,
      	offset: 5
      }
    });

  	it('should should be a method', function () {
    	expect(queryService.roundOffset).to.be.a('function');
  	});

  	it('should round down to the nearest multiple of the limit', function(){
  		expect(queryService.roundOffset(scope1)).to.equal(120);
  		expect(queryService.roundOffset(scope2)).to.equal(3);
  	});
	});
});