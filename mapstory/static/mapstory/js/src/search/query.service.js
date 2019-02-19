/*
 */
(function() {
  angular.module("mapstory.search").service("queryService", queryService);

  function queryService() {
    return {
      addQuery,
      removeQuery,
      toggleQuery,

      validateOffset,
      validateLimit,

      resetOffset,
      roundOffset
    };

    function addQuery(filter, value) {
      const query = existingQuery(this, filter);
      // If an object with a title is passed, use the title
      if (value.hasOwnProperty("title")) {
        value = value.title;
      }
      if (query.indexOf(value) == -1) {
        query.push(value);
        this.query[filter] = query;
        this.search();
      }
    }

    function removeQuery(filter, value) {
      const query = existingQuery(this, filter);
      // If an object with a title is passed, use the title
      if (value.hasOwnProperty("title")) {
        value = value.title;
      }
      // First check if this even exists to remove
      if (query.indexOf(value) > -1) {
        query.splice(query.indexOf(value), 1);
        // Update and run the query
        this.query[filter] = query;
        this.search();
      }
    }

    function toggleQuery(filter, value) {
      const query = existingQuery(this, filter);
      // this is a toggle,
      // if its not there add it, if it is, remove it
      if (query.indexOf(value) == -1) {
        query.push(value);
      } else {
        query.splice(query.indexOf(value), 1);
      }

      this.query[filter] = query;
      this.search();
    }

    function existingQuery(scope, filter) {
      const query = scope.query[filter] ? [scope.query[filter]] : [];
      return _.flatten(query);
    }

    // ///////

    function validateOffset(scope) {
      const limit = scope.query.limit;
      const offset = scope.query.offset;

      if (limit != 0 && offset % limit != 0) {
        scope.query.offset = roundOffset(scope);
      }
    }

    // prevent a limit of 0, reset it to client default
    function validateLimit(scope) {
      if (scope.query.limit == 0) {
        console.log(
          "Resetting to default CLIENT_RESULTS_LIMIT, cannot query API with a 0 limit"
        );
        scope.query.limit = CLIENT_RESULTS_LIMIT;
      }
    }

    // ////////

    function resetOffset(scope) {
      // this function resets the offset to 0 and searches again
      scope.query.offset = 0;
      scope.search();
    }

    // roundOffset rounds offset down to nearest multiple of limit
    // ex: limit: 30, offset: 122 -> sets offset to 120
    function roundOffset(scope) {
      const round = function(value, roundTo) {
        return Math.floor(value / roundTo) * roundTo;
      };
      return round(scope.query.offset, scope.query.limit);
    }
  }
})();
