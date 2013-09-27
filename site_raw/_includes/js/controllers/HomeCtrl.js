
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', '$window', 'solr', '$location', '$timeout', 'packery', function($scope, $http, $window, solr, $location, $timeout, packery) { 

	$scope.recordCount = "0";

	packery.handleLayout();

	// Get record count.
	solr.getRecordCount(function (count) {
		$scope.recordCount = count;
	});

	// Setup photo backgrounds
	$('.home-item-biological')
		.backstretch("/assets/img/photos/kelp.jpg");
	$('.home-item-marine-debris')
		.backstretch("/assets/img/photos/seattle.jpg");
	$('.home-item-human-use')
		.backstretch("/assets/img/photos/chumash.jpg");
	$('.home-item-physical')
		.backstretch("/assets/img/photos/astoria_bridge.jpg");


	// Search
	$scope.search = function () {
		$window.location.href = '/discover/#?text='+$scope.searchText;
	};

	$scope.goTo = function (path) {
		$window.location.href = path;
	};

}]);