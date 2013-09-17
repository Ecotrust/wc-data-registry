
angular.module('wcodpApp').directive('filters', ['$timeout', function($timeout) {

    var defaultCenter = {
        lat: 40.44694705960048,
        lng: -120.76171875,
        zoom: 3
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
                        center: angular.copy(defaultCenter)
                    });
                    angular.extend(scope, {
                        defaults: {
                            //tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                            maxZoom: 8,
                            //doubleClickZoom: false,
                            paths: {
                                p1: {
                                    color: '#008000',
                                    weight: 8,
                                    latlngs: [
                                        { lat: 40.44694705960048, lng: -120.76171875 },
                                        { lat: 45.44694705960048, lng: -130.76171875 },
                                        { lat: 50.44694705960048, lng: -140.76171875 }
                                    ]
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
                        // Location filter map was clicked. But avoid acting on double clicks.
                        var currentZoom = event.currentScope.center.zoom;
                        if (!scope.clickTimerRunning) {
                            scope.clickTimerRunning = $timeout(function() { 
                                scope.clickTimerRunning = null;
                                // Act on single click.
                                if (args && args.leafletEvent && args.leafletEvent.latlng) {
                                    if (console) console.log('center set');
                                    scope.center = { lat: args.leafletEvent.latlng.lat, lng: args.leafletEvent.latlng.lng, zoom: currentZoom }; 
                                    scope.filteredLocation = angular.copy(args.leafletEvent.latlng);
                                    //scope.filteredBoundingBox = 
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
                        scope.location = angular.copy(defaultCenter);
                        scope.notifyFiltersChanged();
                    };

                    scope.init();

                }
            }
        }
    };
}]);