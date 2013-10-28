
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
            list[index] = val.replace(/[.]/g, '|');
        });
        return cats;
    }

    function getIssuesFromUrl () {
        var issues = $location.search().i;
        issues = issues && issues.length > 0 ? issues.split('~') : [];
	_.each(issues, function (val, index, list) {
            list[index] = val.replace(/[.]/g, '|');
        });
        return issues;
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
        var catKeys = _.union(filterVals.categories);
        var issKeys = _.union(filterVals.issues);
        if (catKeys.length > 0 && catKeys[0] !== undefined) {
            if (issKeys.length > 0 && issKeys[0] !== undefined) {
                return facetName + ': ((' + catKeys.join(' AND ') + ') AND (' + issKeys.join(' AND ') + '))';
            } else {
                return facetName + ': (' + catKeys.join(' AND ') + ')';
            }
        } else if (issKeys.length > 0 && issKeys[0] !== undefined) {
            return facetName + ': (' + issKeys.join(' AND ') + ')';
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

        getAllResults: function (resultsPerPage, pageIndex, successCallback, errorCallback) {
            var filterVals = {
                    text: "*",
                    latLng: null,
                    categories: [],
                    issues: []
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
            facetFields = ['sys.src.collections_txt','sys.src.collections_ss'];
            // facetMinCounts.push(mincount);

            if (collectionsQuery.length > 0) { 
                //facetFields.push(collectionsFacetKey);
                //facetFields = ['sys.src.collections_txt','sys.src.collections_ss'];
                facetMinCounts.push(mincount);
                if (textQuery.length > 0) {
                    textQuery = textQuery + ' ' + collectionsQuery;
                } else {
                    textQuery = collectionsQuery;
                }
            }

            if (!textQuery.length > 0) {
                textQuery = '*';
            }

            // Prep query string params.            
            queryConfig.params = {
                'start': (pageIndex - 1) * resultsPerPage,
                'rows': resultsPerPage,
                'wt': 'json', 
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
