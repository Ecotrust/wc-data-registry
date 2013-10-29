
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
                    categories = $location.search().c,
                    issues = $location.search().i,
                    sources = $location.search().s,
                    lat = $location.search().lat,
                    lng = $location.search().lng;

                // Search text filter
                if (_.isString(searchText)) {
                    searchText = $.trim(searchText);
                    if (searchText.length > 0 && $.trim(searchText) != '*') {
                        summaryItems.push('"' + $.trim(searchText) + '"');
                    }
                }

                if (categories) {
                    cat_lst = categories.split('~');
                    for (var i = 0; i < cat_lst.length; i++) {
                        cat = cat_lst[i].split('.');
                        summaryItem = cat[cat.length - 2] + ': ' + cat[cat.length - 1];
                        summaryItems.push(summaryItem.split('_').join(" "));
                    }
                }

                if (issues) {
                    iss_lst = issues.split('~');
                    for (var i = 0; i < iss_lst.length; i++) {
                        iss = iss_lst[i].split('.');
                        summaryItems.push(iss[iss.length - 1].split('_').join(" "));
                    }
                }

                if (sources) {
                    src_lst = sources.split('~');
                    for (var i = 0; i < src_lst.length; i++) {
                        src = src_lst[i].split('.');
                        summaryItems.push(src[src.length - 1].split('_').join(" "));
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
