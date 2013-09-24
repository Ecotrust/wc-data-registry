
angular.module('wcodpApp').directive('resultsList', ['$http', '$location', function($http, $location) {

    return {
        templateUrl: '/assets/views/ResultsListView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            data: "=",
            numFound: "=",
            resultsPerPage: "=",
            pageIndex: "="
        },
        link: function postLink(scope, element, attrs) {
            scope.maxPagesListed = 5; // for pagination

            scope.numPages = function () {
                return Math.ceil(scope.numFound / scope.resultsPerPage);
            };

            scope.isCurrentPage = function (index) {
              return (scope.pageIndex == index);
            };

            scope.showingLastPage = function () {
                return (scope.pageIndex === scope.numPages());
            };

            scope.setPageIndex = function (newVal) {
                scope.pageIndex = newVal;
            };

            /**
             * @return {array} Returns the page indexes to be shown in the 
             * pagination control given the current page index.
             */
            scope.pageIndexes = function () {
                var indexes = [], maxPagesListed = scope.maxPagesListed, start, stop;
                start = Math.floor(scope.pageIndex / maxPagesListed - 0.01) * maxPagesListed + 1;
                stop = start + maxPagesListed;
                if (stop > scope.numPages()) {
                    stop = scope.numPages() + 1;
                }
                for (var i = start; i < stop; i++) {
                    indexes.push(i);
                }
                return indexes;
            };

            /**
             * @return {array of strings} String representations of the filters 
             * in use for display in the results summary.
             */
            scope.getResultsSummaryItems = function () {
                var summaryItems = [],
                    searchText = $location.search().text,
                    lat = $location.search().lat,
                    lng = $location.search().lng;

                // Search text filter
                if (_.isString(searchText)) {
                    searchText = $.trim(searchText);
                    if (searchText.length > 0) {
                        summaryItems.push('"' + $.trim(searchText) + '"');
                    }
                }

                // Location filter
                if (lat && lng) {
                    summaryItems.push("current location");
                }

                return summaryItems;
            };

        }
    };
}]);