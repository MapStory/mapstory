describe('Chip Field Factory', () => {

  let Autocomplete;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(($injector) => {
    ChipField = $injector.get('chipFieldFactory');
  }));

  describe('Chip Field:', () => {
  	let exampleField;

  		 beforeEach(() => {
	      exampleField = new ChipField('example__in', 'example');
	    });

	  it('should should be an object with tidy() and transform() methods', () => {
	    expect(exampleField).to.be.a('object');
	    expect(exampleField.tidy).to.be.a('function');
	    expect(exampleField.transform).to.be.a('function');
	  });

	  describe('results for autocomplte via ._modify()', () => {
	    let mockResult;


	 	});
	});
});