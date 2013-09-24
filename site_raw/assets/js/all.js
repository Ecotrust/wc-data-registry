---
---
/**
 * Begin dependencies scripts
 */
{% include js/third-party/jquery-1.10.2.js %}
{% include js/third-party/angular.js %}
{% include js/third-party/ui-bootstrap-tpls-0.5.0.js %}
{% include js/third-party/packery.pkgd.min.js %}
{% include bower_components/underscore/underscore-min.js %}


/* jQuery plugin to aid in namespaced elements in xml */
$.fn.filterNode = function(name) {
	  return this.find('*').filter(function() {
	    return this.nodeName === name;
	  });
	};

/*
 * End dependencies scripts
 **/

/**
 * Begin site scripts
 */
angular.module('wcodpApp', ['ui.bootstrap', 'leaflet-directive']);
{% include js/services/Solr.js %}
{% include js/services/Metadata.js %}
{% include js/directives/Filters.js %}
{% include js/directives/ResultsList.js %}
{% include js/directives/Result.js %}
{% include js/directives/Leaflet.js %}
{% include js/controllers/HomeCtrl.js %}
{% include js/controllers/DiscoverCtrl.js %}
/*
 * End site scripts
 **/
