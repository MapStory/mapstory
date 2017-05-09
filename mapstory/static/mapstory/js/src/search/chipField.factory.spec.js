describe('Chip Field Factory', function() {

  var Autocomplete;
  beforeEach(module('mapstory.search'));
  beforeEach(inject(function($injector) {
    ChipField = $injector.get('chipFieldFactory');
  }));

  it('should exist', function () {
    should.exist(ChipField);
  });

});