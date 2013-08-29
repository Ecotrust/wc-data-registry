
angular.module('wcodpApp').directive('filters', ['$timeout', function($timeout) {

    return {
        templateUrl: '/assets/views/FiltersView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            onFiltersChanged: "&",
            initialFilterValues: "="
        },
        link: function postLink(scope, element, attrs) {

            scope.init = function () {
                // Set initial filter values.
                if (_.isUndefined(scope.initialFilterValues)) {
                    return;
                }
                scope.searchText = scope.initialFilterValues.searchText;
                if (_.isString(scope.searchText) && scope.searchText.length > 0) {
                    scope.notifyFiltersChanged();    
                }
            };

            // Watch the search text box value.
            scope.runningTimeout = false;
            scope.initialWatchSkipped = false;
            scope.$watch('searchText', function (newValue) {
                if (!scope.initialWatchSkipped) {
                    scope.initialWatchSkipped = true;
                    return;
                }
                if (scope.runningTimeout) {
                    $timeout.cancel(scope.runningTimeout);
                    scope.runningTimeout = false;
                }
                scope.runningTimeout = $timeout(function() { 
                    scope.notifyFiltersChanged();
                }, 300);
            });

            scope.notifyFiltersChanged = function () {
                scope.onFiltersChanged({ filterVals: { 
                        searchText: scope.searchText,
                        categories: [],
                        tags: [],
                        formats: []
                    }});                
            };

            scope.init();
        }
    };
}]);