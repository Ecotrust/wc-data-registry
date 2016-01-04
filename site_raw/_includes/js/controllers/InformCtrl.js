
angular.module('wcodpApp').controller('InformCtrl', ['$scope', function($scope) { 
	// Setup photo backgrounds.
	$('.home-item-marine-debris')
		.backstretch("/assets/img/photos/marinedebris_3.jpg");
	$('.home-item-sea-level-rise')
		.backstretch("/assets/img/photos/sea-level-rise.jpg");
}]);