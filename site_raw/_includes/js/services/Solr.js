
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

    function getTextQuery(filterVals) {
        var q = "{!lucene q.op=AND df=text}",
            txt = filterVals.text,
            applyingOtherFilters = filterVals.latLng !== null;

        q = txt && txt.length > 0 ? q + txt + " " : applyingOtherFilters ? "* " : ""; //q + "* ";
        return q;
    }

    function getBoundingBoxQuery(filterVals) {
        var ll = filterVals.latLng;
        return ll && ll.lat && ll.lng ? "{!bbox pt=" + ll.lat + "," + ll.lng + " sfield=envelope_geo d=0.001} " : "";
    }

    function getKeywords() {
        return '';
        // if (!isEmpty(app.viewModel.keywords())) {

        //  var keywords = '(';
        //  var count = 0;
        //  $.each(app.viewModel.keywords(), function(key, val){
        //      if (count > 0) {
        //          keywords = keywords + ' AND ';
        //      }
        //      keywords = keywords + key;
        //      count++;
        //  });

        //  keywords = keywords + ')';

        //  if (keywords.length > 0) {
        //     app.viewModel.q_query(app.viewModel.q_query() + "keywords: " + keywords + " "); 
        //  }
        // }
    }


    return {
        
        /**
         * Pulls parameters from the query string in the URL to initiate a Solr query. Returns via
         * success and error callbacks.
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
        // getFilterOptions: function (data, successCallback, errorCallback) {
        //     this.query({text: '* '}, 1, 1, successCallback, errorCallback);
        // },

        /**
         * Pulls parameters from the query string in the URL to initiate a Solr query. Returns via
         * success and error callbacks.
         */
        getResultsForQueryString: function (resultsPerPage, pageIndex, successCallback, errorCallback) {
            var filterVals = {
                    text: getTextFromUrl(),
                    latLng: getLatLngFromUrl()
                };

            this.query(filterVals, resultsPerPage, pageIndex, successCallback, errorCallback);
        },

        query: function (filterVals, resultsPerPage, pageIndex, successCallback, errorCallback) {
            var queryConfig = {},
                facetFields = [], 
                facetMinCounts = [],
                facets = ['keywords'],
                mincount = 1;
                
            // Prep query string params.
            _.each(facets, function (value) {
                facetFields.push(value);
                facetMinCounts.push(mincount);
            });
            queryConfig.params = {
                'start': (pageIndex - 1) * resultsPerPage,
                'rows': resultsPerPage,
                'wt': 'json', 
                'q': getTextQuery(filterVals) + getKeywords(),
                'fq': getBoundingBoxQuery(filterVals),
                //'fl': 'contact.organizations_ss, id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
                'fl': '',
                'facet': true,
                'facet.field': facetFields,
                'facet.mincount': facetMinCounts
            };

            // Execute query.
            if (console) { console.log("Querying Solr"); }
            $http.get(solrUrl, queryConfig).success(function (data, status, headers, config) {
                data.filterVals = filterVals;

                //// 
                // Fake Esri customization data
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