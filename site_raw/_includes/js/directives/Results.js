
angular.module('wcodpApp').directive('results', 
function() {

    return {
        templateUrl: '/assets/views/ResultsView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            data: "=",
            filterSelections: "="
        },
        link: function postLink(scope, element, attrs) {

        }
    };
});