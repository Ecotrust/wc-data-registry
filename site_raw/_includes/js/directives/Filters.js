
angular.module('wcodpApp').directive('filters', ['$timeout', '$location', 'browserSize', function($timeout, $location, browserSize) {

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
            showingMobileFiltersModal: "=",
            facets: "="
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
                    scope.mobileMode = browserSize.isPhoneSize();
                    scope.showingMobileFiltersModal = false;

                    scope.init = function () {
                        var queryNeeded = false;

                        scope.syncUiWithQueryString();

                        scope.watchFacets();

                        // Run initial query only if values were provided in 
                        // the query string.
                        queryNeeded = _.isString(scope.searchText) && scope.searchText.length > 0;
                        queryNeeded = queryNeeded || scope.filteredLocation !== null;
                        if (queryNeeded) {
                            scope.updateUrlQueryString(false);
                        }
                    
                        browserSize.watchBrowserWidth(function () {
                            scope.$apply(function () {
                                scope.mobileMode = browserSize.isPhoneSize();
                            });
                        });

                        scope.$watch('showingMobileFiltersModal', function (isMobalHidden) {
                            if (console) { console.log('watcher for showingMobileFiltersModal'); }
                            try {
                                // For mobile devices, modify viewport to be device-height
                                //  only while modal is open.
                                var viewport = document.querySelector("meta[name=viewport]");
                                if (scope.mobileMode && scope.showingMobileFiltersModal) {
                                    viewport.setAttribute('content', 'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                                } else {
                                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                                }
                            } catch (e) {
                                // The browser being used doesn't have querySelector. 
                                // But that's fine. This is targeted at mobile 
                                // devices. Mobile devices have querySelector.
                            }
                        });

                        // For now, relying on jquery for desaturating 
                        // non-hovered filter groups.
                        $('.filter-group-toggle, .filter-group-container').hover(function (event) {
                            $('.filter-group-toggle, .filter-group-container').addClass('desaturated');
                            $(this).removeClass('desaturated');
                            if ($(this).hasClass('filter-group-toggle')) {
                                $(this).next().removeClass('desaturated');
                            } else {
                                $(this).prev().removeClass('desaturated');
                            }
                        }, function (event) {
                            $('.filter-group-toggle, .filter-group-container').removeClass('desaturated');
                        });
                    };

                    scope.watchFacets = function () {
                        scope.$watch('facets', function (newVal) {
                            var collection;
                            collection = scope.parseCollection('category', newVal);
                            scope.categories = collection.categories;
                            collection = scope.parseCollection('issue', newVal);
                            scope.issues = collection.categories;
                        });
                    };

                    /**
                     * Parse collections from Solr JSON (via Esri customization) into 
                     * filter sets.
                     * @param  {string} name        The key for the collection to be parsed (e.g., category, issue)
                     * @param  {object} facetCounts The facet_counts object from a Solr query result. An example of
                     * what this JSON looks like: 
                     * {
                     *   facet_fields: {
                     *     sys.src.collections_txt: [
                     *          "category",
                     *          4,
                     *          "issue",
                     *          3,
                     *          "marinedebris",
                     *          3,
                     *          "biological",
                     *          2,
                     *          "geological",
                     *          2,
                     *          "topology",
                     *          2,
                     *          "habitat",
                     *          1,
                     *          "soil",
                     *          1,
                     *          "species",
                     *          1
                     *      ],
                     *      sys.src.collections_ss: [
                     *          "issue/marineDebris",
                     *          3,
                     *          "category/geological/topology",
                     *          2,
                     *          "category/biological/habitat",
                     *          1,
                     *          "category/biological/species",
                     *          1,
                     *          "category/geological/soil",
                     *          1
                     *      ]
                     *    }
                     * } 
                     * @return {object}    An object tailored for the filter UI.
                     */
                    scope.parseCollection = function (name, facetCounts) {
                        var words,
                            paths,
                            pathArray,
                            count,
                            index,
                            categories = {},
                            isMultiTiered = false; 

                        if (! (_.has(facetCounts.facet_fields, 'sys.src.collections_ss') &&
                            _.has(facetCounts.facet_fields, 'sys.src.collections_txt'))) {
                            return null;
                        }
                            
                        words = facetCounts.facet_fields['sys.src.collections_txt'];
                        paths = facetCounts.facet_fields['sys.src.collections_ss'];

                        // Build data structure. 
                        _.each(paths, function (val, index, list) {
                            var pathArray;
                            if (typeof val === 'number') {
                                return;
                            }

                            pathArray = val.split('/');
                            var collectionName = pathArray[0],
                                categoryName = pathArray[1],
                                subcategoryName = pathArray[2];

                            isMultiTiered = isMultiTiered ? true : subcategoryName ? true : false;

                            if (collectionName === name) {
                                // This entry is in the named collection.
                                if (!_.has(categories, categoryName)) {

                                    // We haven't added this category yet, add it.
                                    index = _.indexOf(words, categoryName.toLowerCase());
                                    count = index > -1 ? words[index + 1] : 0;
                                    categories[categoryName] = {
                                        key: categoryName,
                                        label: categoryName,
                                        count: count,
                                        subcategories: {}
                                    };
                                }

                                // Add subcategory.
                                if (subcategoryName) {
                                    categories[categoryName].subcategories[subcategoryName] = {
                                        key: subcategoryName,
                                        label: subcategoryName,
                                        count: list[index + 1]
                                    };
                                }
                            }
                        });
                        
                        return { 'isMultiTiered': isMultiTiered, 'categories': categories}

                    };

                    /** 
                     * Udates query string in URL with values from the filter
                     * controls. Other components can watch the query string
                     * for changes.
                     */
                    scope.updateUrlQueryString = function (forceNewQuery) {
                        var txt = scope.searchText,
                            ll = scope.filteredLocation,
                            f;

                        if (txt && typeof txt === 'string' && txt.length > 0) {
                            $location.search('text', txt);
                        } else {
                            $location.search('text', null);
                        }

                        if (ll && ll.lat && ll.lng) {
                            $location
                                .search('lat', ll.lat)
                                .search('lng', ll.lng);
                        } else {
                            $location.search('lat', null).search('lng', null);
                        }

                        if (forceNewQuery) {
                            f = parseInt($location.search().f);
                            if (typeof f === 'number' && !isNaN(f)) {
                                f++;
                            } else {
                                f = 0;
                            }
                            $location.search('f', f);
                        }
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
                            scope.updateUrlQueryString();
                        }, 300);
                    });


                    //
                    //  L o c a t i o n   F i l t e r
                    //
                    scope.filteredLocation = null;
                    scope.filteredBoundingBox = null;

                    scope.setFilterLocation = function (latlng) {
                        if (latlng && latlng.lat && latlng.lng) {

                            if (typeof latlng.lat === 'string') {
                                latlng.lat = parseFloat(latlng.lat);
                            }
                            if (typeof latlng.lng === 'string') {
                                latlng.lng = parseFloat(latlng.lng);
                            }

                            // Set map center.
                            scope.center = { 
                                lat: latlng.lat,
                                lng: latlng.lng,
                                zoom: scope.center.zoom 
                            }; 

                            // Set marker to center.
                            scope.markers.mainMarker = {
                               lat: latlng.lat,
                               lng: latlng.lng,
                               //icon: localIcons.whiteMarker,
                               draggable: false,
                               focus: false,
                               title: "Current results include this location."
                            };

                            // Set value used for query.
                            scope.filteredLocation = angular.copy(latlng);
                        
                        } else {
                            // Clear value used for queries.
                            scope.filteredLocation = null;
                            // Remove marker from map.
                            delete scope.markers.mainMarker;
                        }
                    };

                    scope.$on('leafletDirectiveMap.click', function(event, args){
                        // Location filter map was clicked. But avoid acting
                        // on double clicks (otherwise map can end up 
                        // bouncing infinitely between two center points).
                        if (scope.clickTimerRunning) {
                        
                            // This is a multi click. Cancel acting on a 
                            // single click.
                            $timeout.cancel(scope.clickTimerRunning);
                            scope.clickTimerRunning = null;
                        
                        } else {

                            // This is the first click.
                            scope.clickTimerRunning = $timeout(function() { 
                                scope.clickTimerRunning = null;
                                // Act on single click.
                                if (args && args.leafletEvent && args.leafletEvent.latlng) {
                                    scope.setFilterLocation(args.leafletEvent.latlng);
                                    scope.updateUrlQueryString();
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
                        scope.updateUrlQueryString();
                    };


                    //
                    //  Sync UI with query string
                    //
                    scope.watchQueryString = function () {
                        scope.$watch('getQueryString()', function (newValue, oldValue) {
                            scope.syncUiWithQueryString();
                        });
                    };

                    scope.getQueryString = function () {
                        var qs = "";
                        _.each($location.search(), function (val) {
                            qs = qs + val;
                        });
                        return qs;
                    };

                    scope.syncUiWithQueryString = function () {
                        scope.searchText = $location.search().text;
                        scope.setFilterLocation({
                            lat: $location.search().lat,
                            lng: $location.search().lng
                        });
                        scope.isLocationCollapsed = (scope.filteredLocation == null);
                    };

                    scope.manualSubmit = function () {
                        
                        $timeout(function () {
                            // Was experiencing an infinite loop once in 
                            // a while on submit. Trying this in a timeout.
                            // Haven't seen it happen again yet.

                            scope.updateUrlQueryString(false);

                            // Hide mobile filters modal.
                            scope.showingMobileFiltersModal = false;
                            
                            // Remove focus from search text box 
                            // (mobile keyboard stays open otherwise)
                            $('#search-filter input').blur();

                            // Scroll to top.
                            if (scope.mobileMode) {
                                setTimeout(function () {
                                  window.scrollTo(0, 1);
                                }, 100);
                            }

                        }, 1);
                    };

                    scope.init();
                    scope.watchQueryString();
                }
            }
        }
    };
}]);