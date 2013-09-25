
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

            scope.links = [];

            scope.metadata = {
                datePublished: '--',
                creator: '--',
                publisher: '--',
                contactName: '--',
                contactEmail: '--',
                constraints: '--'
            };

            scope.allowedLinkTypes = {
                csv: { label: 'CSV' },
                ftp: { label: 'FTP' },
                html: { label: 'HTML' },
                img: { label: 'IMG' },
                kml: { label: 'KML' },
                kmz: { label: 'KMZ' },
                pdf: { label: 'PDF' },
                shp: { label: 'SHP' },
                tar: { label: 'TAR' },
                tiff: { label: 'TIFF' },
                txt: { label: 'TXT' },
                wcs: { label: 'WCS' },
                wfs: { label: 'WFS' },
                wms: { label: 'WMS' },
                xls: { label: 'XLS' },
                xlsx: { label: 'XLSX' },
                zip: { label: 'ZIP' },
                esrirest: { label: 'ESRI REST' }
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
                var elem = angular.element($event.currentTarget).parents('.result');
                if (elem.hasClass('result-opened')) {
                    angular.element($event.currentTarget).parents('.result')
                        .removeClass('result-opened')
                        .addClass('result-closed');
                    // Prevent bubbling event to the result.
                    if ($event.stopPropagation) $event.stopPropagation();
                    if ($event.preventDefault) $event.preventDefault();
                    $event.cancelBubble = true;
                    $event.returnValue = false;
                }
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

            scope.metadataXmlUrl = function () {
                return '/geoportal/rest/document?id=' + scope.resultData['sys.src.item.uri_s'];
            };

            scope.jsonUrl = function () {
                return scope.metadataXmlUrl() + '&f=pjson';
            };

            scope.getLinks = function () {
                $http.get(scope.jsonUrl()).success(function (data) {
                    var allLinks = [];
                    scope.links = [];

                    try {
                        allLinks = data.records[0].links;
                    } catch (e) {}

                    _.each(allLinks, function (element, index, list) {
                        if (element.type && angular.lowercase(element.type) in scope.allowedLinkTypes) {
                            element.type = angular.lowercase(element.type);
                            scope.links.push(element);
                        }
                    });

                }).error(function (data) {
                    if (console) { console.log('Error getting result links.'); }  
                });
            };

            scope.getLinks();
        }
    };
}]);