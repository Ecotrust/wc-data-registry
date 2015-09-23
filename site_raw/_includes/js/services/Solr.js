
angular.module('wcodpApp').factory('solr', ['$http', '$location', function($http, $location) {

    // This is a relive URL and will work when served from staging or production servers.
    var solrUrl = '/solr/collection1/select?';

    // This is an absolute URL for local dev server
    //var solrUrl = 'http://portal.westcoastoceans.org/solr/collection1/select?';
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

    function getFormatsFromUrl () {
        var sources = $location.search().f;
        sources = sources && sources.length > 0 ? sources.split('~') : [];
        _.each(sources, function (val, index, list) {
            list[index] = val.replace(/[_]/g, ' ');
        });
        return sources;
    }

    function getSourcesFromUrl () {
        var sources = $location.search().s;
        sources = sources && sources.length > 0 ? sources.split('~') : [];
        _.each(sources, function (val, index, list) {
            list[index] = val.replace(/[_]/g, ' ');
        });
        return sources;
    }

    function getTextQuery(filterVals) {
        var q = "{!lucene q.op=AND df=text}",
            txt = filterVals.text,
            applyingTextFilter = (filterVals.latLng !== null && filterVals.latLng !== undefined),
            applyingCatFilter = filterVals.categories ? filterVals.categories.length > 0 : false,
            applyingIssueFilter = filterVals.issues ? filterVals.issues.length > 0 : false,
            applyingNonTextFilters = (applyingTextFilter || applyingCatFilter || applyingIssueFilter);

        q = txt && txt.length > 0 ? q + txt : applyingNonTextFilters ? q + '* ' : '';
        return q;
    }

    function getBoundingBoxQuery(filterVals) {
        var ll = filterVals.latLng;
        return ll && ll.lat && ll.lng ? "{!bbox pt=" + ll.lat + "," + ll.lng + " sfield=envelope_geo d=0.001} " : "";
    }

    function getCollectionsQuery(facetName, filterVals) {
        //TODO: add source keys and language
        var catKeys = _.union(filterVals.categories);
        var issKeys = _.union(filterVals.issues);
        var srcKeys = _.union(filterVals.sources);
        if (catKeys.length > 0 && catKeys[0] !== undefined) {  //1--
            if (issKeys.length > 0 && issKeys[0] !== undefined) {  //11-
	                return facetName + ': ((' + catKeys.join(' AND ') + ') AND (' + issKeys.join(' AND ') + '))';
            } else {  //10-
                    return facetName + ': (' + catKeys.join(' AND ') + ')';
            }
        } else {  //0--
            if (issKeys.length > 0 && issKeys[0] !== undefined) {  //01-
                    return facetName + ': (' + issKeys.join(' AND ') + ')';
            } else {  //00-
                    return '';
            }
        }
    }

    function getSitesQuery(facetName, filterVals) {
        var srcKeys = _.union(filterVals.sources);
        if (srcKeys.length > 0 && srcKeys[0] !== undefined) {  //001
            return facetName + ':"' + srcKeys.join('" AND "') + '"';
        } else {  //000
            return '';
        }
    }

    function getFormatsQuery(facetName, filterVals) {
        var srcKeys = _.union(filterVals.formats);
        if (srcKeys.length > 0 && srcKeys[0] !== undefined) {  //001
            return facetName + ':"' + srcKeys.join('" AND "') + '"';
        } else {  //000
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
                issues: getIssuesFromUrl(),
                formats: getFormatsFromUrl(),
                sources: getSourcesFromUrl(),
            };
            this.query(filterVals, resultsPerPage, pageIndex, successCallback, errorCallback);
        },
   
        getAllResults: function (resultsPerPage, pageIndex, successCallback, errorCallback) {
            var filterVals = {
                text: "*",
                latLng: null,
                categories: [],
                issues: [],
                sources: []
            };
  
            this.query(filterVals, resultsPerPage, pageIndex, successCallback, errorCallback);
        },
    
        query: function (filterVals, resultsPerPage, pageIndex, successCallback, errorCallback) {
            var queryConfig = {},
                textQuery = getTextQuery(filterVals),
                boundingBoxQuery = getBoundingBoxQuery(filterVals);
                collectionsFacetKey = 'sys.src.collections_ss',
                collectionsQuery = getCollectionsQuery(collectionsFacetKey, filterVals),
                sitesQuery = getSitesQuery('sys.src.site.name_s', filterVals),
                formatsQuery = getFormatsQuery('dataAccessType_ss', filterVals),
                fQuery = [],
                facetFields = [], 
                facetMinCounts = [],
                mincount = 1;
            // Prep facets to include.
            facetFields = ['sys.src.collections_txt','sys.src.collections_ss','sys.src.site.name_s', 'dataAccessType_ss'];
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
            }else{
                textQuery += '*';
            }


            if (boundingBoxQuery!=='') {
                fQuery.push(boundingBoxQuery);
            }
            if (sitesQuery !== '') {
                fQuery.push(sitesQuery);
            }
            if (formatsQuery !== '') {
                fQuery.push(formatsQuery);
            }



            // Prep query string params.            
            queryConfig.params = {
                'start': (pageIndex - 1) * resultsPerPage,
                'rows': resultsPerPage,
                'wt': 'json', 
                'q': textQuery,
                'fq': fQuery,
                //'fl': 'contact.organizations_ss, id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
                'fl': '',
                'facet': true,
                'facet.field': facetFields,
                'facet.mincount': facetMinCounts,
                'f.sys.src.site.name_s.facet.mincount': mincount
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
        } // /query
    }; // /return
} // /anon function($http, $location)
]
);
