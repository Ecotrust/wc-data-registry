
angular.module('wcodpApp').factory('marinePlanner', ['$http', '$timeout', function($http, $timeout) {

    var _availableLayers = [],
        _availableLayersEndpoint = 'http://visualize.westcoastoceans.org/geoportal-ids/',
        _layerUrlPattern = 'http://visualize.westcoastoceans.org/{layerSlug}/';


    /**
     * The first time the function is called, it stores a promise for an 
     * ajax call to grab the full list of UUIDs for layers Todd has added
     * to MP. The first use of the promise will cache the list for further
     * uses of the promise.
     */



    /**
     * [_getListOfLayers description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function _getListOfLayers (callback) {
        if (_availableLayers.length > 0) {
            callback(_availableLayers);
        } else {
            // Grab list of visualizable layers from mp.
            $http.get(_availableLayersEndpoint).success(function (data) {
                // 'data' should be a collection of objects, each containing 
                // an id and a slug.
                
                // Cache result so we don't always have to fetch the list 
                // from marine planner.
                _availableLayers = data;
                
                // Satisfy the current request.
                callback(_availableLayers);

            }).error(function (data) {
                if (console) { console.log('Error getting available layers list from marine planner.'); }  
            });
        }
    }


    /**
     * [_getLayerSlug description]
     * @param  {[type]} uuid [description]
     * @param  {[type]} list [description]
     * @return {[type]}      [description]
     */
    function _getLayerSlug (uuid, list) {
        // TODO, probably using underscore
        return 'slug-slug';
    }


    return {

        getMarinePlannerUrl: function (uuid, success_callback, error_callback) {
            _getListOfLayers(function (list) {
                var slug = _getLayerSlug(uuid, list),
                    url = slug ? _layerUrlPattern.replace('{layerSlug}', slug) : null;
                if (url) {
                    success_callback(url);
                } else {
                    error_callback();
                }
            });
        }

    };

}]);