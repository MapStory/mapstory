 /*
  */
(function() {
'use strict';

  angular
    .module('mapstory')
    .service('page', page);
  
  function page() {
    return {
      paginate: paginate,
      resetOffset: resetOffset,
      roundOffset: roundOffset,

      up: up,
      down: down,
      
      _changePage: changePage,
      _apiPaginate: apiPaginate,
      _manualPaginate: manualPaginate
    }
  
    //////////////////////

    function paginate(response, view, scope){
      var meta = response.data.meta;

      // pagination info under meta property is only available on content (resource base API) 
      if (meta.current_page != undefined) {
        apiPaginate(response, view);
      } else {
        // do the django paginator logic on the front end
        if(scope.query.offset === 0 || scope.query.offset < meta.total_count) {
          view.resultCount = meta.total_count;
          manualPaginate(view, scope);
        } else {
          // throw error and reset if offset is greater than total results
          console.log("Offset was higher than total count. Setting offset to 0 and searching again.");
          resetOffset(scope);
        }
      }
    };

    // given an api response and a controller view, this sets pagination and 'showing' values
    function apiPaginate(response, view){
      view.resultCount = response.data.meta.total_count;
      view.thisPage = response.data.meta.current_page;
      view.pages = response.data.meta.num_pages;

      view.resultStart = response.data.meta.start_index;
      view.resultsShowing = response.data.meta.end_index;
    };

    // given an api response that doesn't use django paginator, this sets pagination values
    // "page a of b"  "showing x - y of z results"
    function manualPaginate(view, scope){
      var limit = scope.query.limit;
      var offset = scope.query.offset;
      var cards = scope.cards || view.cards;
      
      view.thisPage = Math.ceil(offset / limit) + 1;
      view.pages = Math.ceil(view.resultCount / limit);

      view.resultStart = Number(offset) + 1;
      view.resultsShowing =  Number(offset) + Number(cards.length);
    };

    function resetOffset(scope){
      // this function resets the offset to 0 and searches again
      scope.query.offset = 0;
      scope.search();
      //TODO: test this to make sure it doesn't overflow the stack
      // should there be a note in the UI that we reset their value? or just a console log for devs?
    };

    // roundOffset rounds offset down to nearest multiple of limit
    // ex: limit: 30, offset: 122 -> sets offset to 120
    function roundOffset(scope){
      var round = function(value, roundTo) {
        return Math.floor(value / roundTo) * roundTo;
      }
      return round(scope.query.offset, scope.query.limit); 
    };

    function changePage(view, scope){
      var limit = scope.query.limit;
      var page = view.thisPage - 1; //stepback to a 0 index

      var nextOffset = limit * page; 
      // next offset will be a multiple of the current limit
      scope.query.offset = nextOffset;
      
      // update result cards
      // some controllers will have the search method 
      // on the view model and some on the scope
      var search = scope.search || view.search;
      search();
    };

    function up(view, scope){
      return function(){
        if(view.thisPage < view.pages){
          view.thisPage += 1;
          changePage(view, scope);
        }
      }
    };

    function down(view, scope){
      return function(){
        if(view.thisPage > 1){
          view.thisPage -= 1;
          changePage(view, scope);
        }
      }
    };
  };
})();