describe('mapstory.search.autocomplete', function() {

  var Autocomplete;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    Autocomplete = $injector.get('autocomplete');
  }));

  it('should exist', function () {
    should.exist(Autocomplete);
  });

	describe('_tidyQuery', function () {
		it('should take in query list or string and return an array', function () {
			expect(Autocomplete._tidyQuery).to.be.a('function');
			
			var fakequery = { 
				'string': 'stringyMcGee',
				'list': ['here', 'there'],
				'number': '1'
			 }
			
			expect(Autocomplete._tidyQuery('string', fakequery)).to.be.a('array');
			expect(Autocomplete._tidyQuery('list', fakequery)).to.be.a('array');
			expect(Autocomplete._tidyQuery('number', fakequery)).to.be.a('array');
		});

		it('should partially apply a fields given filter to create a tidy method', function () {
    	var query = {
    		'owner__username__in': 'Chris',
    		'keywords__slug__in': ['here', 'there', 'everywhere']
    	};

    	expect(Autocomplete.authors.tidy(query)).to.deep.equal(['Chris']);
    	expect(Autocomplete.tags.tidy(query)).to.deep.equal(['here', 'there', 'everywhere']);
  	});

	});

});