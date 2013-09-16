
angular.module('wcodpApp').controller('HomeCtrl', ['$scope', '$http', function($scope, $http) { 

	var $container = $('#home');
	$container.packery({
		itemSelector: '.home-item',
		gutter: 10
	});

}]);