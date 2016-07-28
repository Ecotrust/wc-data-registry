
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', '$window', 'solr', '$location', '$timeout', 'packery', function($scope, $http, $window, solr, $location, $timeout, packery) { 

	// Get record count.
	$scope.recordCount = "0";
	solr.getRecordCount(function (count) {
		$scope.recordCount = count;
	});

	// Let Packery do its thing.
	packery.handleLayout();

	// Setup photo backgrounds.
	$('.home-item-biological')
		.backstretch("/assets/img/photos/kelp.jpg");
	$('.home-item-marine-debris')
		.backstretch("/assets/img/photos/marinedebris_3.jpg");
	$('.home-item-human-use')
		.backstretch("/assets/img/photos/chumash.jpg");
	$('.home-item-physical')
		.backstretch("/assets/img/photos/astoria_bridge.jpg");

	// Setup map in location block.
	$scope.map = {
		center: {
			lat: 40.44694705960048,
			lng: -120.76171875,
			zoom: 3
		},
		options: {
	        maxZoom: 8,

	        tileLayer: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.png',

	        tileLayerOptions: {
	            attribution: '',
	            subdomains: '1234'
	        }
	        //},
			//zoomControl: false
		}
	};
	$('.home-item-location .labeling-layer').click(function (event) {
		event.stopImmediatePropagation();
		
		// Hide labeling that is overlayed atop the map.
		$(this).hide();
		
		// Expand the block.
		$('.home-item-location').addClass('gigante');
		var pckry = packery.getInstance();
		pckry.fit($('.home-item-location')[0]);
	});


	// Search
	$scope.search = function () {
		var searchText = "*";
		if ($scope.searchText && $scope.searchText.length > 0) {
			searchText = $scope.searchText;
		}
		$window.location.href = '/discover/#?text='+searchText;
	};

	$scope.goTo = function (path) {
		$window.location.href = path;
	};

}]);
