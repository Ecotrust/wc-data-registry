
angular.module('wcodpApp').directive('result', ['$http', '$location', function($http, $location) {

    return {
        templateUrl: '/assets/views/ResultView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            resultData: "="
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