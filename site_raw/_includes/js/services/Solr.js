
angular.module('wcodpApp').factory('solr', ['$http', function($http) {

    var solrUrl = '/solr/collection1/select?';


    function getSearchText(filterValues) {
        if (filterValues.searchText && _.isString(filterValues.searchText)) {
            return filterValues.searchText;
        }
        return "";
    };

    function getSearchTextForQuery(filterValues) {
        var q = "{!lucene q.op=AND df=text}",
            val = getSearchText(filterValues),
            applyingOtherFilters = false;

        applyingOtherFilters = filterValues.location != null;

        q = val.length > 0 ? q + val + " " : applyingOtherFilters ? "* " : " "; //q + "* ";
        return q;
    };

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
    };

    function getBoundingBoxQuery(centerPoint) {
        if (centerPoint && centerPoint.lat && centerPoint.lng) {
            return "{!bbox pt=" + centerPoint.lat + "," + centerPoint.lng + " sfield=envelope_geo d=0.001} ";
        } else {
            return "";
        }
    };



    return {
        
        getRecordCount: function (callback) {
            if (!callback) {
                return;
            }
            this.querySolr({searchText: '* '}, 5, 1, function (data) {
                callback(data.response.numFound);
            }, function (data) {
                if (console) console.log('Failed to get record count.');
            });
        },

        querySolr: function (filterValues, resultsPerPage, pageIndex, successCallback, errorCallback) {
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
                'q': getSearchTextForQuery(filterValues) + getKeywords(filterValues),
                'fq': getBoundingBoxQuery(filterValues.location),
                //'fl': 'contact.organizations_ss, id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
                'fl': '',
                'facet': true,
                'facet.field': facetFields,
                'facet.mincount': facetMinCounts
            };

            // Execute query.
            if (console) { console.log("Querying Solr (SERVICE)"); }
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