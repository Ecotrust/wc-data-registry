
angular.module('wcodpApp').directive('result', ['$http', '$location', 'metadata', 'marinePlanner', function($http, $location, metadata, marinePlanner) {

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

            scope.map = null;

            scope.marinePlannerUrl = '';

            //scope.geoportalUrl = "http://wcga-vm01.sdsc.edu";
            scope.geoportalUrl = "http://wcgardf.sdsc.edu";

            scope.metadata = {
                datePublished: '',
                creator: '',
                publisher: '',
                contactName: '',
                contactEmail: '',
                constraints: ''
            };

            scope.allowedLinkTypes = {
                csv: {
                    label: 'CSV',
                    tooltip: "Comma Separated Values"
                },
                ftp: {
                    label: 'FTP',
                    tooltip: "File Transfer Protocol"
                },
                html: {
                    label: 'HTML',
                    tooltip: "Web Page or Styled Metadata"
                },
                img: {
                    label: 'IMG',
                    img: "Image File"
                },
                kml: {
                    label: 'KML',
                    tooltip: "Google Earth KML File"
                },
                kmz: {
                    label: 'KMZ',
                    tooltip: "Google Earth KML File"
                },
                pdf: {
                    label: 'PDF',
                    tooltip: "PDF Document"
                },
                shp: { 
                    label: 'SHP',
                    tooltip: "ESRI Shapefile"
                },
                tar: {
                    label: 'TAR',
                    tooltip: "Archival File Format"
                },
                tiff: {
                    label: 'TIFF',
                    tooltip: "Georeferenced TIFF Image File"
                },
                txt: {
                    label: 'TXT',
                    tooltip: "Text Document"
                },
                wcs: {
                    label: 'WCS',
                    tooltip: "OGC Web Coverage Service"
                },
                wfs: {
                    label: 'WFS',
                    tooltip: "OGC Web Feature Service"
                },
                wms: {
                    label: 'WMS',
                    tooltip: "OGC Web Mapping Service"
                },
                xls: {
                    label: 'XLS',
                    tooltip: "Excel Spreadsheet"
                },
                xlsx: {
                    label: 'XLSX',
                    tooltip: "Excel Spreadsheet"
                },
                zip: {
                    label: 'ZIP',
                    tooltip: "Compressed Files for Download"
                },
                esrirest: {
                    label: 'ESRI REST',
                    tooltip: "ArcGIS Server Web Service"
                },
				website: {
                    label: 'Open',
                    tooltip: "Go to web page with more information"
                }
            };


            scope.resultClicked = function($event) {
                var elem = angular.element($event.currentTarget),
                    closed = elem.hasClass('result-closed'),
                    id = elem.attr('id'),
                    mapContainer, 
                    bounds;
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
                    //mapContainer = elem.find('.result-map');
                    bounds = scope.resultData.envelope_geo;
                    if (bounds.length) {
                        scope.setupMap(id, bounds[0].split(" "));
                    }
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


            scope.setupMap = function (mapContainerId, bounds) {
                if (scope.map) { 
                    // Already setup
                    return; 
                }
                if (bounds.length === 4) {
                    var p1 = new L.LatLng(bounds[1], bounds[0]), // sw
                        p2 = new L.LatLng(bounds[3], bounds[2]), // ne
                        bbox = new L.Rectangle([p1, p2], {color: "#ff7800", weight: 1, clickable: false});

                    scope.map = new L.Map('result-map-' + mapContainerId, {
                        doubleClickZoom: false,
                        scrollWheelZoom: false,
                        zoomControl: false,
                        dragging: false,
                        touchZoom: false,
                        boxZoom: false,
                        tap: false,
                        keyboard: false
                    }).fitBounds(bbox);

                    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                        attribution: '',
                        subdomains: '1234'
                    }).addTo(scope.map);

                    bbox.addTo(scope.map);

                    scope.map.attributionControl.setPrefix('');

                }
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
                return scope.geoportalUrl + '/geoportal/rest/document?id=' + scope.resultData['sys.sync.foreign.id_s'];
            };

            scope.jsonUrl = function () {
                return scope.metadataXmlUrl() + '&f=pjson';
            };
            
            scope.getMarinePlannerUrl = function () {
                var uuid = scope.resultData['sys.sync.foreign.id_s'];
                if (scope.marinePlannerUrl.length === 0) {
                    var success = function (result) {
                        scope.marinePlannerUrl = result;
                    };
                    var error = function () {
                        scope.marinePlannerUrl = '';
                    };
                    marinePlanner.getMarinePlannerUrl(uuid, success, error);
                }
            };
            scope.getMarinePlannerUrl();


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
