describe('Chip Field Factory', function() {

  var Autocomplete;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    ChipField = $injector.get('chipFieldFactory');
  }));

  describe('Chip Field:', function() {
  	var exampleField;

  		 beforeEach(function(){
	      exampleField = new ChipField('example__in', 'example');
	    });

	  it('should should be an object with tidy() and transform() methods', function () {
	    expect(exampleField).to.be.a('object');
	    expect(exampleField.tidy).to.be.a('function');
	    expect(exampleField.transform).to.be.a('function');
	  });

	  describe('results for autocomplte via ._modify()', function(){
	    var mockResult;


	 	});
	});
});