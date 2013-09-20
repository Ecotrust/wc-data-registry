
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', 'solr', function($scope, $http, solr) { 

	// Initialize Packery
	var $container = $('#home');
	$container.packery({
		itemSelector: '.home-item',
		gutter: 10
	});

	// Get record count.
	solr.getRecordCount(function (count) {
		$scope.recordCount = count;
	});

}]);