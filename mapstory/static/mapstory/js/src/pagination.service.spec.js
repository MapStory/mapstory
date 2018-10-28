describe('Pagination Service', () => {

  let page;
  beforeEach(module('mapstory'));
  beforeEach(inject(($injector) => {
    page = $injector.get('page');
  }));

  it('should exist', () => {
    should.exist(page);
  });

  it('should should be an object with these methods', () => {
    expect(page).to.be.a('object');
    expect(page.paginate).to.be.a('function');
    expect(page._apiPaginate).to.be.a('function');
    expect(page._manualPaginate).to.be.a('function');
    expect(page._changePage).to.be.a('function');
    expect(page.down).to.be.a('function');
    expect(page.up).to.be.a('function');
  });

   xdescribe('paginate', () => {
  	let response; let view; let scope;

    beforeEach(() => {
      
    });

  	it('should should be a method', () => {
    	expect(page.paginate).to.be.a('function');
  	});

  	it('should use django pagination values when available', () => {

  	});

  	it('should create pagination values when not provided by the api', () => {

  	});

  	it('should reset the offset if higher than total count', () => {
  		// offset can not be greater than or equal to total results
  		// expect resetOffset to be called
  	});

  	it('should reset limit if given 0', () => {

  	})
	});

  xdescribe('manualPaginate', () => {
  	let view; let scope;

    beforeEach(() => {
      
    });

    it('should create page number values', () => {
  		// they should be whole numbers
  		// first page should never be 0
  	});

  	it('should set the result index values to the view', () => {
  		// 
  	});

	});
});