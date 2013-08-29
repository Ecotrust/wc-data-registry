---
---
/**
 * Begin dependencies scripts
 */
{% include bower_components/underscore/underscore-min.js %}


{% include bower_components/bootstrap/js/bootstrap-transition.js %}
{% include bower_components/bootstrap/js/bootstrap-dropdown.js %}
{% include bower_components/bootstrap/js/bootstrap-collapse.js %}
{% include bower_components/bootstrap/js/bootstrap-tooltip.js %}
/*
 * End dependencies scripts
 **/

/**
 * Begin site scripts
 */
angular.module('wcodpApp', []);
{% include js/directives/Filters.js %}
{% include js/directives/Results.js %}
{% include js/controllers/HomeCtrl.js %}
{% include js/controllers/DiscoverCtrl.js %}
/*
 * End site scripts
 **/
