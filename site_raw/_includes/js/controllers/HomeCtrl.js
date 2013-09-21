
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', '$window', 'solr', function($scope, $http, $window, solr) { 

	// Initialize Packery
	var $container = $('#home');
	$container.packery({
		itemSelector: '.home-item',
		gutter: 10
	});

	// Get record count.
	$scope.recordCount = -1;
	solr.getRecordCount(function (count) {
		$scope.recordCount = count;
	});

	// Search
	$scope.search = function () {
		$window.location.href = '/discover#?text='+$scope.searchText;
	};

}]);