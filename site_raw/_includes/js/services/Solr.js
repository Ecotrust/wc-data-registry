
angular.module('wcodpApp').factory('solr', ['$http', '$location', function($http, $location) {

    var solrUrl = '/solr/collection1/select?';

    function getTextFromUrl() {
        var txt = $location.search().text;
        return (txt) ? txt : "";
    }

    function getLatLngFromUrl() {
        var lat = $location.search().lat,
            lng = $location.search().lng;
        return (lat && lng) ? {lat: lat, lng: lng} : null;
    }

    function getCategoriesFromUrl () {
        var cats = $location.search().c;
        cats = cats && cats.length > 0 ? cats.split('~') : [];
        _.each(cats, function (val, index, list) {
            list[index] = val.replace(/[.]/g, '/');
        });
        return cats;
    }

    function getIssuesFromUrl () {
        var issues = $location.search().i;
        return issues && issues.length > 0 ? issues.split('~') : [];
    }

    function getTextQuery(filterVals) {
        var q = "{!lucene q.op=AND df=text}",
            txt = filterVals.text,
            applyingTextFilter = (filterVals.latLng !== null && filterVals.latLng !== undefined),
            applyingCatFilter = filterVals.categories ? filterVals.categories.length > 0 : false,
            applyingIssueFilter = filterVals.issues ? filterVals.issues.length > 0 : false,
            applyingNonTextFilters = (applyingTextFilter || applyingCatFilter || applyingIssueFilter);

        q = txt && txt.length > 0 ? q + txt : applyingNonTextFilters ? '*' : '';
        return q;
    }

    function getBoundingBoxQuery(filterVals) {
        var ll = filterVals.latLng;
        return ll && ll.lat && ll.lng ? "{!bbox pt=" + ll.lat + "," + ll.lng + " sfield=envelope_geo d=0.001} " : "";
    }

    function getCollectionsQuery(facetName, filterVals) {
        var keys = _.union(filterVals.categories, filterVals.issues);
        if (keys.length > 0 && keys[0] !== undefined) {
            return facetName + ': (' + keys.join(' OR ') + ')';
        } else {
            return '';
        }
    }

    return {
        
        /**
         * callback is called with a single paramter: the total record 
         * count in the database.
         */
        getRecordCount: function (callback) {
            this.query({text: '* '}, 1, 1, function (data) {
                if (callback) { 
                    callback(data.response.numFound);
                }
            }, function (data) {
                if (console) console.log('Failed to get record count.');
            });
        },

        /**
         * Pulls parameters from the query string in the URL to initiate a Solr query. Returns via
         * success and error callbacks.
         */
        getResultsForQueryString: function (resultsPerPage, pageIndex, successCallback, errorCallback) {
            var filterVals = {
                    text: getTextFromUrl(),
                    latLng: getLatLngFromUrl(),
                    categories: getCategoriesFromUrl(),
                    issues: getIssuesFromUrl()
                };

            this.query(filterVals, resultsPerPage, pageIndex, successCallback, errorCallback);
        },

        query: function (filterVals, resultsPerPage, pageIndex, successCallback, errorCallback) {
            var queryConfig = {},
                textQuery = getTextQuery(filterVals),
                boundingBoxQuery = getBoundingBoxQuery(filterVals);
                collectionsFacetKey = 'sys.src.collections_ss',
                collectionsQuery = getCollectionsQuery(collectionsFacetKey, filterVals),
                facetFields = [], 
                facetMinCounts = [],
                mincount = 1;

            // Prep facets to include.
            //HOWDY RYAN, uncomment this when Esri customization ready.
            // if (collectionsQuery.length > 0) { 
            //     facetFields.push(collectionsFacetKey);
            //     facetMinCounts.push(mincount);
            // }

            // Prep query string params.            
            queryConfig.params = {
                'start': (pageIndex - 1) * resultsPerPage,
                'rows': resultsPerPage,
                'wt': 'json', 
                // HOWDY RYAN, uncomment this when Esri customization ready.
                //'q': textQuery + ' ' + collectionsQuery,
                // HOWDY RYAN, comment out this line when Esri customization is ready.
                'q': textQuery,
                'fq': boundingBoxQuery,
                //'fl': 'contact.organizations_ss, id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
                'fl': '',
                'facet': true,
                'facet.field': facetFields,
                'facet.mincount': facetMinCounts
                //'sort': 'date asc' or 'date desc'
            };

            // Execute query.
            if (console) { console.log("Querying Solr"); }
            $http.get(solrUrl, queryConfig).success(function (data, status, headers, config) {
                data.filterVals = filterVals;

                //// 
                // HOWDY RYAN, here's a modified version of the fake Esri 
                // customization data. Remove this when customization is 
                // deployed.
                // 
                data.facet_counts.facet_fields['sys.src.collections_txt'] = [
                    "category", 6,
                    "issue", 4,
                    "marinedebris", 3,
                    "humanuse", 2,
                    "biological", 2,
                    "physical", 2,
                    "topology", 2,
                    "habitat", 1,
                    "species", 1,
                    "sealevelrise", 1,
                    "shippingroutes", 1,
                    "waveenergysites", 1
                ];

                data.facet_counts.facet_fields['sys.src.collections_ss'] = [
                    "issue/marineDebris", 3,
                    "category/physical/topology", 2,
                    "category/biological/habitat", 1,
                    "category/biological/species", 1,
                    "category/humanUse/shippingRoutes", 1,
                    "category/humanUse/waveEnergySites", 1,
                    "issue/seaLevelRise", 1
                ];
                // 
                // End Esri customization data
                ////

                if (successCallback) {
                    successCallback(data);
                }
            }).error(function (data, status, headers, config) {
                data.filterVals = filterVals;
                if (errorCallback) {
                    errorCallback(data);
                }
            });
        }

    };

}]);