
/**
 * A simple scrollTo directive using $anchorScroll. The directive also 
 * catches the locationChangeStart event thus preventing a page reload.
 * From http://plnkr.co/edit/Sl2V4u3tVzsqEj7ttgNi?p=preview
 */
angular.module('wcodpApp')
  .directive('scrollTo', function ($location, $anchorScroll) {
    return function(scope, element, attrs) {
    element.bind('click', function(event) {
			event.stopPropagation();
			scope.$on('$locationChangeStart', function(ev) {
			  ev.preventDefault();
			});
			var location = attrs.scrollTo;
			$location.hash(location);
			$anchorScroll();
		});
	};
  });
