---
---

// Avoid `console` errors in browsers that lack a console. From HTML5 Boilerplate: https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/**
 * Begin dependencies scripts
 */
{% include js/third-party/jquery-1.10.2.js %}
{% include js/third-party/angular.js %}
{% include js/third-party/ui-bootstrap-tpls-0.5.0.js %}
{% include js/third-party/packery.pkgd.min.js %}
{% include js/third-party/backstretch.min.js %}
{% include js/third-party/bootstrap-tooltip.js %}
{% include bower_components/underscore/underscore-min.js %}

/*
 * End dependencies scripts
 **/

/**
 * Begin site scripts
 */
angular.module('wcodpApp', ['ui.bootstrap', 'leaflet-directive']);
// Filters
{% include js/filters/TitleCase.js%}
// Services
{% include js/services/Solr.js %}
{% include js/services/MarinePlanner.js %}
{% include js/services/Packery.js %}
{% include js/services/Metadata.js %}
{% include js/services/BrowserSize.js %}
// Directives
{% include js/directives/Filters.js %}
{% include js/directives/ResultsList.js %}
{% include js/directives/Result.js %}
{% include js/directives/Leaflet.js %}
{% include js/directives/ScrollTo.js %}
// Controllers
{% include js/controllers/HomeCtrl.js %}
{% include js/controllers/DiscoverCtrl.js %}
{% include js/controllers/AboutCtrl.js %}
{% include js/controllers/InformCtrl.js %}

// Force iPhone address bar to hide.
setTimeout(function () {
  window.scrollTo(0, 1);
}, 100);

/*
 * End site scripts
 **/
