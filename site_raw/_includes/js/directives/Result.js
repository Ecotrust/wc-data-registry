
angular.module('wcodpApp').directive('result', ['$http', '$location', 'metadata', function($http, $location, metadata) {

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
            
            scope.metadata = {
                datePublished: '--',
                creator: '--',
                publisher: '--',
                contactName: '--',
                contactEmail: '--',
                constraints: '--'
            };

            scope.resultClicked = function($event) {
                var closed = angular.element($event.currentTarget).hasClass('result-closed'),
                    id = angular.element($event.currentTarget).attr('id');
                if (closed) {
                    // Close all results.
                    angular.element($event.currentTarget)
                        .parent().find('.result')
                        .removeClass('result-opened')
                        .addClass('result-closed');
                    // Open the clicked result.
                    angular.element($event.currentTarget)
                        .removeClass('result-closed')
                        .addClass('result-opened');
                    // Populate metadata fields
                    scope.populateMetadataFields(id);
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

            scope.linkClicked = function ($event) {
                // Prevent bubbling event to the result.
                if ($event.stopPropagation) $event.stopPropagation();
                $event.cancelBubble = true;
            };

            scope.populateMetadataFields = function (id) {
                var mUrl = scope.metadataXmlUrl(id);
                // Get XML and retrieve only specific values from it
                metadata.getXml(mUrl, function (xml) {
                    scope.$apply(function () {
                        _.each(scope.metadata, function (val, key) {
                            scope.metadata[key] = metadata.get(key, xml);
                        });
                    });
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