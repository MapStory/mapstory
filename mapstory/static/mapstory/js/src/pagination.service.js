 /*
  */
(function() {
'use strict';

  angular
    .module('mapstory')
    .service('page', page);
  
  function page(queryService) {
    return {
      paginate: paginate,

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
          view.totalCount = meta.total_count;
          manualPaginate(view, scope);
        } else {
          // throw error and reset if offset is greater than total results
          console.log("Offset was higher than total count. Setting offset to 0 and searching again.");
          queryService.resetOffset(scope);
        }
      }
    };

    // given an api response and a controller view, this sets pagination and 'showing' values
    function apiPaginate(response, view){
      view.totalCount = response.data.meta.total_count;
      view.currentPage = response.data.meta.current_page;
      view.numPages = response.data.meta.num_pages;

      view.startIndex = response.data.meta.start_index;
      view.endIndex = response.data.meta.end_index;
    };

    // given an api response that doesn't use django paginator, this sets pagination values
    // "page a of b"  "showing x - y of z results"
    function manualPaginate(view, scope){
      var limit = scope.query.limit;
      var offset = scope.query.offset;
      var cards = scope.cards || view.cards;
      
      view.currentPage = Math.ceil(offset / limit) + 1;
      view.numPages = Math.ceil(view.totalCount / limit);

      view.startIndex = Number(offset) + 1;
      view.endIndex =  Number(offset) + Number(cards.length);
    };

    function changePage(view, scope){
      var limit = scope.query.limit;
      var page = view.currentPage - 1; //stepback to a 0 index

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
        if(view.currentPage < view.numPages){
          view.currentPage += 1;
          changePage(view, scope);
        }
      }
    };

    function down(view, scope){
      return function(){
        if(view.currentPage > 1){
          view.currentPage -= 1;
          changePage(view, scope);
        }
      }
    };
  };
})();