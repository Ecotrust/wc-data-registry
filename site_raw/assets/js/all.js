---
---
/**
 * Begin dependencies scripts
 */
{% include js/third-party/jquery-1.10.2.js %}
{% include js/third-party/angular.js %}
{% include js/third-party/ui-bootstrap-tpls-0.5.0.js %}
{% include js/third-party/ui-bootstrap-tpls-0.5.0.js %}
{% include bower_components/underscore/underscore-min.js %}
/*
 * End dependencies scripts
 **/

/**
 * Begin site scripts
 */
angular.module('wcodpApp', ['ui.bootstrap']);
{% include js/directives/Filters.js %}
{% include js/directives/Results.js %}
{% include js/controllers/HomeCtrl.js %}
{% include js/controllers/DiscoverCtrl.js %}
/*
 * End site scripts
 **/
