
angular.module('wcodpApp').factory('packery', ['$timeout', function($timeout) {

    var pckry;

    return {
        
        /**
         * Looks for a div with .packery-container class and initializes
         * packery which then handles updating the layout on resize.
         */
        handleLayout: function (callback) {

            // Grab container
            var $container = $('.packery-container');

            // Initialize Packery in that container
            $container.packery({
                itemSelector: '.home-item',
                gutter: 10,
                isInitLayout: false
            });

            // Manually trigger initial layout
            pckry = $container.data('packery');
            $timeout(function () {
                pckry.layout();
            }, 2);
        }

    };

}]);