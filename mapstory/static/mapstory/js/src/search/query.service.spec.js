describe('Query Validation Service', () => {

  let queryService;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(($injector) => {
    queryService = $injector.get('queryService');
  }));

  it('should exist', () => {
    should.exist(queryService);
  });

  it('should should be an object with these methods', () => {
    expect(queryService.roundOffset).to.be.a('function');
    expect(queryService.resetOffset).to.be.a('function');
  });

	xdescribe('resetOffset', () => {
  	let scope;

    beforeEach(() => {
      
    });

  	it('should reset the offset to 0', () => {
  		
  	});

  	it('should search again after reseting the offset', () => {
  		
  	});

	});

  describe('roundOffset', () => {
  	const scope1 = {};
  	const scope2 = {};

    beforeEach(() => {
      scope1.query = {
      	limit: 30,
      	offset: 122
      };

      scope2.query = {
      	limit: 3,
      	offset: 5
      }
    });

  	it('should should be a method', () => {
    	expect(queryService.roundOffset).to.be.a('function');
  	});

  	it('should round down to the nearest multiple of the limit', () => {
  		expect(queryService.roundOffset(scope1)).to.equal(120);
  		expect(queryService.roundOffset(scope2)).to.equal(3);
  	});
	});
});