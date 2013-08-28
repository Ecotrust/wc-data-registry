
angular.module('wcodpApp').directive('filters', 
function() {

    return {
        templateUrl: '/assets/views/FiltersView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            onQueryFinished: "&",
            filterSelections: "="
        },
        link: function postLink(scope, element, attrs) {

        }
    };
});