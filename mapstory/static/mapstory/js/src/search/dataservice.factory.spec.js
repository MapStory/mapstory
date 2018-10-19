describe('Data Service', function() {

  var dataservice;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    dataService = $injector.get('dataService');
  }));

  it('should exist', function () {
    should.exist(dataService);
  });

  describe('Region Service:', function() {

	  it('should should be an object with get() and _modify() methods', function () {
	    expect(dataService).to.be.a('object');
	    expect(dataService.getRegions).to.be.a('function');
	    expect(dataService._modify).to.be.a('function');
	  });

	  describe('results for autocomplte via ._modify()', function(){
	    var mockResult, apiCount, randomEntry;

	    beforeEach(function(){
	      mockResult = dataService._modify(mockRegions);
	      apiCount = mockRegions.data.objects.length;

	      //randomize an entry from modified array of all region results
	      randomEntry = mockResult.all[_.random(0, apiCount - 1)];
	    });
	    
	    it('should return an object with "all" and "byCodes" properties', function(){
	      expect(mockResult).to.be.an('object');
	      
	      should.exist(mockResult.all);
	      expect(mockResult.all).to.be.a('array');

	      should.exist(mockResult.byCodes);
	      expect(mockResult.byCodes).to.be.a('object');
	    });

	    it('each should have the same number of entries as the mockAPI response', function(){
	      var allCount = mockResult.all.length;
	      var byCodesCount = Object.keys(mockResult.byCodes).length;

	      expect(allCount).to.equal(apiCount);
	      expect(byCodesCount).to.equal(apiCount);
	    });
	 
	 		describe('array of all country results', function(){
	      it('each should still have properties "code" and "name" that are strings', function(){
	        expect(randomEntry.code).to.be.a('string');
	        expect(randomEntry.name).to.be.a('string');
	      });

	  		it('each should now have a property "_lower" with lowercased name & code for autocomplete', function(){
	        var name = randomEntry.name;
	        var code = randomEntry.code;
	        var _lower = randomEntry._lower;

	  			expect(_lower).to.be.a('array');
	  			expect(_lower).to.have.lengthOf(2);

	        expect(name.toLowerCase()).to.equal(_lower[0]);
	        expect(code.toLowerCase()).to.equal(_lower[1]);
	  		});
	 		});

	 		describe('index of countries by codes', function(){
	 			it('should return an identical region object given a regions code', function(){
	        var byCodes = mockResult.byCodes;
	        var code = randomEntry.code;

	        expect(byCodes[code]).to.deep.equal(randomEntry);
	  		});
	 		});
	  });

	  /* Dev HACK: mock a response from GeoNode Regions API 
	      - update ../../mockRegionsAPI.js with json response from '/api/regions/'
	      - un-skip and run this test block (remove 'x')
	      - will bark if API has changed in a way that affects our autocomplete
	   */
	  
	  describe('[dev hack] mock JSON of /api/regions response', function(){
	    it('should be the same length as geonode APIs expected list of regions', function(){
	      var regions = mockRegions.data.objects;

	      expect(regions).to.have.lengthOf(259, 'the number of regions has changed');
	    });

	    it('regions should have properties "code" and "name" that are strings', function(){
	      var code = mockRegions.data.objects[111].code;
	      var name = mockRegions.data.objects[222].name;

	      expect(code).to.be.a('string', 'the region code property has changed');
	      expect(code).to.have.lengthOf(3, 'the region "code" is no longer 3 letters');
	      expect(name).to.be.a('string', 'the region "name" property has changed');
	    });
	  }); 
	});

});