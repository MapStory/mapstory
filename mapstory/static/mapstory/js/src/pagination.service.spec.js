describe('Pagination Service', function() {

  var page;
  beforeEach(module('mapstory'));
  beforeEach(inject(function($injector) {
    page = $injector.get('page');
  }));

  it('should exist', function () {
    should.exist(page);
  });

  it('should should be an object with these methods', function () {
    expect(page).to.be.a('object');
    expect(page.paginate).to.be.a('function');
    expect(page._apiPaginate).to.be.a('function');
    expect(page._manualPaginate).to.be.a('function');
    expect(page.roundOffset).to.be.a('function');
    expect(page.resetOffset).to.be.a('function');
    expect(page._changePage).to.be.a('function');
    expect(page.down).to.be.a('function');
    expect(page.up).to.be.a('function');
  });

   xdescribe('paginate', function() {
  	var response, view, scope;

    beforeEach(function(){
      
    });

  	it('should should be a method', function () {
    	expect(page.paginate).to.be.a('function');
  	});

  	it('should use django pagination values when available', function(){

  	});

  	it('should create pagination values when not provided by the api', function(){

  	});

  	it('should reset the offset if higher than total count', function(){
  		// offset can not be greater than or equal to total results
  		//expect resetOffset to be called
  	});

  	it('should reset limit if given 0', function(){

  	})
	});

  xdescribe('manualPaginate', function() {
  	var view, scope;

    beforeEach(function(){
      
    });

    it('should create page number values', function(){
  		// they should be whole numbers
  		// first page should never be 0
  	});

  	it('should set the result index values to the view', function(){
  		// 
  	});

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
    	expect(page.roundOffset).to.be.a('function');
  	});

  	it('should round down to the nearest multiple of the limit', function(){
  		expect(page.roundOffset(scope1)).to.equal(120);
  		expect(page.roundOffset(scope2)).to.equal(3);
  	});
	});
});