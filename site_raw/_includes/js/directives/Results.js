
angular.module('wcodpApp').directive('results', 
function() {

    return {
        templateUrl: '/assets/views/ResultsView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            data: "=",
            numFound: "=",
            filterValues: "=",
            resultsPerPage: "="
        },
        link: function postLink(scope, element, attrs) {
            scope.rootElement = element;

            scope.result_clicked = function($event) {
                // Make all results non-active.
                $(scope.rootElement).find('result').removeClass('result-opened').addClass('result-closed');
                // Make just the clicked item active.
                $($event.currentTarget).toggleClass('result-closed').toggleClass('result-opened');
            };

        }
    };
});