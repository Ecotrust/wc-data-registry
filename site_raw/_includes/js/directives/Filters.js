
angular.module('wcodpApp').directive('filters', ['$timeout', function($timeout) {

    var defaultCenter = {
        lat: 40.44694705960048,
        lng: -120.76171875,
        zoom: 3
    };

    var localIcons = {
        whiteMarker: L.icon({
            iconUrl: 'http://localhost:8082/assets/img/icons/map_marker_wht.png', //TODO: this isn't working so far, absolute or relative
            //shadowUrl: 'http://leafletjs.com/docs/images/leaf-shadow.png',
            iconSize:     [38, 95],
            shadowSize:   [50, 64],
            iconAnchor:   [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor: [4, 62]
        })
    };


    return {
        templateUrl: '/assets/views/FiltersView.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            onFiltersChanged: "&",
            initialFilterValues: "="
        },
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, element, attrs, controller) { 
                    // Some prelink setup is necessary for the location filter.
                    angular.extend(scope, {
                        center: angular.copy(defaultCenter),
                        markers: {},
                        paths: {
                            // p1: {
                            //     color: '#800000',
                            //     weight: 8,
                            //     latlngs: [
                            //         { lat: 40.44694705960048, lng: -120.76171875 },
                            //         { lat: 45.44694705960048, lng: -130.76171875 },
                            //         { lat: 50.44694705960048, lng: -140.76171875 }
                            //     ]
                            // }
                        }
                    });
                    angular.extend(scope, {
                        mapOptions: {
                            maxZoom: 8,
                            tileLayer: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', //'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
                            tileLayerOptions: {
                                attribution: '',
                                subdomains: '1234'
                            },
                            icon: {
                                url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon.png',
                                retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon@2x.png',
                                size: [25, 41],
                                anchor: [12, 40],
                                popup: [0, -40],
                                shadow: {
                                    url: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
                                    retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png',
                                    size: [41, 41],
                                    anchor: [12, 40]
                                }
                            }
                        }
                    });                    
                },
                post: function postLink(scope, element, attrs, controller) { 

                    scope.isLocationCollapsed = true;
                    scope.isCategoryCollapsed = true;
                    scope.isTagsCollapsed = true;


                    scope.init = function () {
                        // Set initial filter values.
                        if (_.isUndefined(scope.initialFilterValues)) {
                            return;
                        }
                        scope.searchText = scope.initialFilterValues.searchText;
                        if (_.isString(scope.searchText) && scope.searchText.length > 0) {
                            scope.notifyFiltersChanged();    
                        }
                        $('.filter-group-toggle').hover(function (event) {
                            $('.filter-group-toggle').addClass('desaturated');
                            $(this).removeClass('desaturated');
                            console.log('in');
                        }, function (event) {
                            $('.filter-group-toggle').removeClass('desaturated');
                            console.log('out');
                        });
                    };

                    scope.notifyFiltersChanged = function () {
                        if (console) {
                            console.log('Filters Changed -- notifying');
                        }
                        scope.onFiltersChanged({ filterVals: { 
                                searchText: scope.searchText,
                                location: scope.filteredLocation,
                                categories: [],
                                tags: [],
                                formats: []
                            }});          
                        // TODO: listen for results recieved to show bounding boxes. scope.filteredBoundingBox = 
                    };


                    //
                    //  T e x t   F i l t e r
                    //
                    scope.runningTimeout = false;
                    scope.initialWatchSkipped = false;

                    scope.$watch('searchText', function (newValue) {
                        //if (!scope.initialWatchSkipped) {
                        //    scope.initialWatchSkipped = true;
                        //    return;
                        //}
                        if (scope.runningTimeout) {
                            $timeout.cancel(scope.runningTimeout);
                            scope.runningTimeout = false;
                        }
                        scope.runningTimeout = $timeout(function() { 
                            scope.notifyFiltersChanged();
                        }, 300);
                    });



                    //
                    //  L o c a t i o n   F i l t e r
                    //
                    scope.filteredLocation = null;
                    scope.filteredBoundingBox = null;

                    scope.$on('leafletDirectiveMap.click', function(event, args){
                        // Location filter map was clicked. But avoid acting on double 
                        // clicks (otherwise map can end up bouncing infinitely between 
                        // two center points).
                        var currentZoom = event.currentScope.center.zoom;
                        if (!scope.clickTimerRunning) {
                            scope.clickTimerRunning = $timeout(function() { 
                                scope.clickTimerRunning = null;
                                
                                // Act on single click.
                                if (args && args.leafletEvent && args.leafletEvent.latlng) {
                                    // Set map center.
                                    scope.center = { 
                                        lat: args.leafletEvent.latlng.lat, 
                                        lng: args.leafletEvent.latlng.lng, 
                                        zoom: currentZoom 
                                    }; 
                                    // Set marker to center.
                                    scope.markers.mainMarker = {
                                       lat: scope.center.lat,
                                       lng: scope.center.lng,
                                       //icon: localIcons.whiteMarker,
                                       draggable: false,
                                       focus: false,
                                       title: "Current results include this location."
                                    };
                                    // Set value used for query.
                                    scope.filteredLocation = angular.copy(args.leafletEvent.latlng);
                                    scope.notifyFiltersChanged();
                                }

                            }, 200);
                        }
                    });

                    scope.$on('leafletDirectiveMap.dblclick', function(event, args){
                        if (scope.clickTimerRunning) {
                            // Cancel a previous single click.
                            $timeout.cancel(scope.clickTimerRunning);
                            scope.clickTimerRunning = null;
                        }
                    });

                    scope.clearLocationFilter = function () {
                        scope.filteredLocation = null;
                        scope.filteredBoundingBox = null;
                        delete scope.markers.mainMarker;
                        scope.location = angular.copy(defaultCenter);
                        scope.notifyFiltersChanged();
                    };

                    scope.init();

                }
            }
        }
    };
}]);