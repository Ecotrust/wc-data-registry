
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', '$window', 'solr', '$location', '$timeout', function($scope, $http, $window, solr, $location, $timeout) { 

	$scope.recordCount = "0";

	// Initialize Packery
	var $container = $('.packery-container');
	$container.packery({
		itemSelector: '.home-item',
		gutter: 10,
		isInitLayout: false
	});

	$scope.pckry = $container.data('packery');

	// manually trigger initial layout
	$timeout(function () {
		$scope.pckry.layout();	
	}, 2);


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