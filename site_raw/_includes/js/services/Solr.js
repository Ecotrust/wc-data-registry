
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
        
        getRecordCount: function (callback) {
            this.querySolr({text: '* '}, 1, 1, function (data) {
                if (callback) { 
                    callback(data.response.numFound);
                }
            }, function (data) {
                if (console) console.log('Failed to get record count.');
            });
        },

        getResultsForQueryString: function (resultsPerPage, pageIndex, successCallback, errorCallback) {
            var filterVals = {
                    text: getTextFromUrl(),
                    latLng: getLatLngFromUrl()
                };

            this.querySolr(filterVals, resultsPerPage, pageIndex, successCallback, errorCallback);
        },

        querySolr: function (filterVals, resultsPerPage, pageIndex, successCallback, errorCallback) {
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
                if (successCallback) {
                    successCallback(data);
                }
            }).error(function (data, status, headers, config) {
                if (errorCallback) {
                    errorCallback(data);
                }
            });
        }

    };

}]);