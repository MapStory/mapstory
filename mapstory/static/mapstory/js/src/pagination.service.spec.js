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
});