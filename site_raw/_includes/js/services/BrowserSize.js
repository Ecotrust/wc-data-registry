
angular.module('wcodpApp').factory('browserSize', ['$document', function($document) {


    return {
        
        widths: {
            // Using Twitter's Bootstrap defaults.
            phoneMax:   767,
            tabletMin:  768,
            tabletMax:  979,
            desktopMin: 980
        },

        isPhoneSize: function () {
            var bw = this.getBrowserWidth();
            return bw <= this.widths.phoneMax;
        },

        isTableSize: function () {
            var bw = this.getBrowserWidth();
            return this.widths.tabletMin <= bw && bw <= this.widths.tabletMax;
        },

        isDesktopSize: function () {
            var bw = this.getBrowserWidth();
            return this.widths.desktopMin <= bw;
        },

        getBrowserWidth: function () {
            return $document[0].body.clientWidth;
        },

        watchBrowserWidth: function (callback) {
            $(window).resize(function(event) {
                if (callback) {
                    callback();
                }
            });
        }

    };

}]);