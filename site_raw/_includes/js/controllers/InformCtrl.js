
angular.module('wcodpApp').controller('InformCtrl', ['$scope', function($scope) { 
	// Setup photo backgrounds.
	$('.home-item-marine-debris')
		.backstretch("/assets/img/photos/marinedebris_3.jpg");
	$('.home-item-ocean-uses')
		.backstretch("/assets/img/photos/lighthouse_med.jpg");
	$('.home-item-ocean-conditions')
		.backstretch("/assets/img/photos/waves_red_med.jpg");
}]);