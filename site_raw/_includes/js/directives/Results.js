
angular.module('wcodpApp').directive('results', [function() {

    return {
        templateUrl: '/assets/views/ResultsView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            data: "=",
            numFound: "=",
            filterValues: "=",
            resultsPerPage: "=",
            pageIndex: "="
        },
        link: function postLink(scope, element, attrs) {
            scope.rootElement = element;
            scope.maxNumShown = 5;

            scope.resultClicked = function($event) {
                var closed = angular.element($event.currentTarget).hasClass('result-closed');
                // Close all results.
                scope.rootElement.find('.result').removeClass('result-opened').addClass('result-closed');
                // Open the clicked result if it was previously closed.
                if (closed) {
                    angular.element($event.currentTarget).removeClass('result-closed').addClass('result-opened');
                } 
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

        }
    };
}]);