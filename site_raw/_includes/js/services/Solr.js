
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
        return cats && cats.length > 0 ? cats.split('~') : [];
    }

    function getIssuesFromUrl () {
        var issues = $location.search().i;
        return issues && issues.length > 0 ? issues.split('~') : [];
    }

    function getTextQuery(filterVals) {
        var q = "{!lucene q.op=AND df=text}",
            txt = filterVals.text,
            applyingOtherFilters = filterVals.latLng !== null || 
                (filterVals.categories && filterVals.categories.length > 0) ||
                (filterVals.issues && filterVals.issues.length > 0);

        q = txt && txt.length > 0 ? q + txt : applyingOtherFilters ? '*' : '';
        return q;
    }

    function getBoundingBoxQuery(filterVals) {
        var ll = filterVals.latLng;
        return ll && ll.lat && ll.lng ? "{!bbox pt=" + ll.lat + "," + ll.lng + " sfield=envelope_geo d=0.001} " : "";
    }

    function getFacetQuery(facetName, selectedFacetKeys) {
        var keys = selectedFacetKeys;
        if (keys && _.isArray(keys) && keys.length > 0) {
            return facetName + ': (' + keys.join(' AND ') + ')';
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
                categoryQuery = getFacetQuery('category', filterVals.categories),
                issueQuery = getFacetQuery('issue', filterVals.issues),
                facetFields = [], 
                facetMinCounts = [],
                mincount = 1;

            // Prep facets to include.
            // HOWDY RYAN, uncomment this when Esri customization ready.
            // if (categoryQuery.length > 0) { 
            //     facetFields.push('category'); 
            //     facetMinCounts.push(mincount);
            // }
            // if (issueQuery.length > 0) { 
            //     facetFields.push('issue'); 
            //     facetMinCounts.push(mincount);
            // }

            // Prep query string params.            
            queryConfig.params = {
                'start': (pageIndex - 1) * resultsPerPage,
                'rows': resultsPerPage,
                'wt': 'json', 
                // HOWDY RYAN, uncomment this when Esri customization ready.
                // 'q': textQuery + ' ' + categoryQuery + ' ' + issueQuery,
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
                // HOWDY RYAN, here's the fake Esri customization data. Remove 
                // this when customization is deployed.
                // 
                data.facet_counts.facet_fields['sys.src.collections_txt'] = [
                    "category", 4,
                    "issue", 3,
                    "marinedebris", 3,
                    "biological", 2,
                    "geological", 2,
                    "topology", 2,
                    "habitat", 1,
                    "soil", 1,
                    "species", 1
                ];

                data.facet_counts.facet_fields['sys.src.collections_ss'] = [
                    "issue/marineDebris", 3,
                    "category/geological/topology", 2,
                    "category/biological/habitat", 1,
                    "category/biological/species", 1,
                    "category/geological/soil", 1
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