angular.module('wcodpApp').filter('titleCase', function() {
	return function (input) {
		// Solr/Geoportal might provide something like 'marineDebris' and 
		// we want it to display as 'Marine Debris'. This filter splits
		// 'marineDebris' into separate words and then sets them to title 
		// case.
		var words;

		// Spit into words.
		words = input.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');

		// Title case
		for (var i = 0; i < words.length; i++) {
			words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
		}
		return words.join(' ');
	}
});
