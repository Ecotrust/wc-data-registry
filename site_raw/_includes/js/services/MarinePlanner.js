
angular.module('wcodpApp').factory('marinePlanner', ['$http', '$location', function($http, $location) {

    var _availableLayers = [],
        _slugPlaceholder = '{layerSlug}',
        _isProduction = $location.host().indexOf('westcoastoceans.org') > -1,
        _mpProdUrl = 'http://maps.westcoastoceans.org',
        _mpStagingUrl = 'http://maps.westcoastoceans.org',
        _mpUrl = _isProduction ? _mpProdUrl : _mpStagingUrl,
        _availableLayersEndpoint = _mpUrl + '/data_manager/geoportal_ids?callback=JSON_CALLBACK',
        _layerUrlPattern = _mpUrl + '/visualize/#' + _slugPlaceholder;


    /**
     * The first time this function is called, it retreives this list and
     * stores a cached version of it for later requests.
     */
    function _getListOfLayers (callback) {
        if (_availableLayers.length > 0) {
            callback(_availableLayers);
        } else {
            // Grab list of visualizable layers from mp.
            $http.jsonp(_availableLayersEndpoint).success(function (data) {
                // 'data' should be a collection of objects, each containing 
                // an id and a slug.
                
                // Cache result so we don't always have to fetch the list 
                // from marine planner.
                _availableLayers = data;
                
                //
                // For testing purposes comment the above line adn replace with this:
                //
                // _availableLayers = {
                //     geoportal_layers: [
                //         {
                //             uuid: "174BE5C6-F9E8-4978-9F1B-CF0862920AA8",
                //             name: "American Indian Trust Lands (USCB, 2010)",
                //             slug: "american-indian-trust-lands-uscb-2010"
                //         }
                //     ]
                // };
                // 
                
                // Satisfy the current request.
                callback(_availableLayers);

            }).error(function (data, status, headers, config) {
                if (console) { console.log('Error getting available layers list from marine planner.'); }  
            });
        }
    }


    /**
     *  Searches the contents of a list for an entry with a matching 
     *  uuid and returns the slug variable of that entry. An example 
     *  of the data structure is as follows
     * 
     *  [
     *      {
     *          uuid: "sample-geoportal-uuid",
     *          name: "American Indian Trust Lands (USCB, 2010)",
     *          slug: "american-indian-trust-lands-uscb-2010"
     *      }
     *  ]
     *
     */
    function _getLayerSlug (uuid, list) {
        var cleanUuid = uuid.replace('{', '').replace('}', ''),
            layerEntry;
        if (_.isObject(list) && _.isArray(list.geoportal_layers)) {
            layerEntry = _.findWhere(list.geoportal_layers, {'uuid': cleanUuid});
            return layerEntry ? layerEntry.slug : null;
        }
        return null;
    }


    return {

        /**
         * An asynchronous call to get a url, if any exists, from a Marine Planner
         * end point that currently sits at: 
         * http://maps.westcoastoceans.org/data_manager/geoportal_ids
         */
        getMarinePlannerUrl: function (uuid, success_callback, error_callback) {
            _getListOfLayers(function (list) {
                var slug = _getLayerSlug(uuid, list),
                    url = slug ? _layerUrlPattern.replace(_slugPlaceholder, slug) : null;
                if (url) {
                    success_callback(url);
                } else {
                    error_callback();
                }
            });
        }

    };

}]);