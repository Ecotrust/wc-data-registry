
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
                    angular.extend(scope, {
                        center: angular.copy(defaultCenter)
                    });

                    angular.extend(scope, {
                        defaults: {
                            //tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                            maxZoom: 8,
                            paths: {
                                p1: {
                                    color: '#008000',
                                    weight: 8,
                                    latlngs: [
                                        { lat: 40.44694705960048, lng: -120.76171875 },
                                        { lat: 45.44694705960048, lng: -130.76171875 },
                                        { lat: 50.44694705960048, lng: -140.76171875 }
                                    ],
                                }
                            }

                        }
                    });                    
                },
                post: function postLink(scope, element, attrs, controller) { 

                    scope.isLocationCollapsed = true;
                    scope.isCategoryCollapsed = true;
                    scope.isTagsCollapsed = true;
                    scope.isFormatsCollapsed = true;
                    scope.filteredLocation = null;
                    scope.filteredBoundingBox = null;

                    scope.$on('leafletDirectiveMap.click', function(event, args){
                        // Location filter map was clicked.
                        if (args && args.leafletEvent && args.leafletEvent.latlng) {
                            scope.center = { lat: args.leafletEvent.latlng.lat, lng: args.leafletEvent.latlng.lng, zoom: event.currentScope.center.zoom };
                            scope.filteredLocation = angular.copy(args.leafletEvent.latlng);
                            scope.filteredBoundingBox = 
                            scope.notifyFiltersChanged();
                        }
                    });

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

                    scope.notifyFiltersChanged = function () {
                        scope.onFiltersChanged({ filterVals: { 
                                searchText: scope.searchText,
                                center: scope.filteredLocation,
                                categories: [],
                                tags: [],
                                formats: []
                            }});                
                    };

                    scope.clearLocationFilter = function () {
                        scope.filteredLocation = null;
                        scope.filteredBoundingBox = null;
                        scope.center = angular.copy(defaultCenter);
                        scope.notifyFiltersChanged();
                    };

                    scope.init();

                }
            }
        }
    };
}]);