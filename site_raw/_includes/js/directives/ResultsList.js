
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
            scope.rootElement = element;
            scope.maxNumShown = 5;

            scope.resultClicked = function($event) {
                var closed = angular.element($event.currentTarget).hasClass('result-closed'),
                    id = angular.element($event.currentTarget).attr('id');
                if (closed) {
                    // Close all results.
                    scope.rootElement.find('.result')
                        .removeClass('result-opened')
                        .addClass('result-closed');
                    // Open the clicked result.
                    angular.element($event.currentTarget)
                        .removeClass('result-closed')
                        .addClass('result-opened');
                    // Populate metadata fields
                    scope.populateMetadataFields(element, id);
                }
            };

            scope.resultCloseClicked = function ($event) {
                angular.element($event.currentTarget).parent()
                    .removeClass('result-opened')
                    .addClass('result-closed');
                // Prevent bubbling event to the result.
                if ($event.stopPropagation) $event.stopPropagation();
                if ($event.preventDefault) $event.preventDefault();
                $event.cancelBubble = true;
                $event.returnValue = false;
            };

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
                var indexes = [], maxNumShown = scope.maxNumShown, start, stop;
                start = Math.floor(scope.pageIndex / maxNumShown - 0.01) * maxNumShown + 1;
                stop = start + maxNumShown;
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
                    searchText = scope.trim(searchText);
                    if (searchText.length > 0) {
                        summaryItems.push('"' + scope.trim(searchText) + '"');
                    }
                }

                // Location filter
                if (lat && lng) {
                    summaryItems.push("current location");
                }

                return summaryItems;
            };

            scope.trim = function (val) {
                if (val == null) return '';
                return String(val).replace(new RegExp('\^\\s+|\\s+$', 'g'), '');
            };


            scope.populateMetadataFields = function (element, id) {
                var mUrl = scope.metadataXmlUrl(id);
                // Get XML and retrieve only specific values from it
                $http.get(mUrl).success(function (xml) {
                    //scope.date = metadata.get('data', xml);
                    // ... create a Result directive
                    // ... create a Metadata service
                }).error(function (data) {
                    if (console) console.log('Error getting metadata XML.');

                });                
            };

            scope.metadataXmlUrl = function (id) {
                return '/geoportal/rest/document?id=' + id;
            };

            scope.jsonUrl = function (id) {
                return scope.metadataXmlUrl(id) + '&f=pjson';
            };

        }
    };
}]);