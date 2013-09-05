
angular.module('wcodpApp').controller('DiscoverCtrl', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) { 
	$scope.solrUrl = '/solr/collection1/select?';
	$scope.filterValues = {};
	$scope.resultsData = {};
	$scope.numFound = 0;
	$scope.resultsPerPage = 5;
	$scope.startIndex = 0;
	$scope.pageIndex = 1;

	$scope.onLoad = function () {
		// Populate filter values from parameters in the URL.
		var initialFilterValues = {
			searchText: $location.search().text,
		};
		$scope.filterValues = initialFilterValues;

		$scope.$watch('resultsPerPage', function (newValue) {
			$scope.runQuery($scope.filterValues, true);
		});
		$scope.watchPageIndex();
	};

	$scope.runQuery = function (filterVals, resetPagination) {
		if (resetPagination) {
			$scope.unwatchPageIndex();
			$scope.pageIndex = 1;
			$scope.watchPageIndex();
		}
		$scope.filterValues = filterVals;
		$scope.querySolr($scope.filterValues);
	};

	$scope.querySolr = function (filterValues) {
		var queryConfig = {},
			facetFields = [], 
			facetMinCounts = [],
			facets = ['keywords'],
			mincount = 1;
			
		// Prep query string params.
		_.each(facets, function (value) {
			facetFields.push(value);
			facetMinCounts.push(mincount);
		});
		queryConfig.params = {
			'start': ($scope.pageIndex - 1) * $scope.resultsPerPage,
			'rows': $scope.resultsPerPage,
			'wt': 'json', 
			'q': $scope.getSearchTextForQuery() + $scope.getKeywords(filterValues),
			'fq': '',
			'fl': 'id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
			'facet': true,
			'facet.field': facetFields,
			'facet.mincount': facetMinCounts
		};

		// Execute query.
		$http.get($scope.solrUrl, queryConfig).success(function (data, status, headers, config) {
			$location
				.search('text', $scope.getSearchText())
				.replace();
			$scope.resultsData = data.response.docs;
			$scope.numFound = data.response.numFound;
		}).error(function (data, status, headers, config) {
			$scope.resultsData = {};
			$scope.numFound = 0;
		});
	};

	$scope.getSearchText = function () {
		if ($scope.filterValues.searchText && _.isString($scope.filterValues.searchText)) {
			return $scope.filterValues.searchText;
		}
		return "";
	};

	$scope.getSearchTextForQuery = function () {
		var q = "{!lucene q.op=AND df=text}",
			val = $scope.getSearchText();
		q = val.length > 0 ? q + val + " " : ""; //q + "* ";
		return q;
	};

	$scope.getKeywords = function () {
		return '';
		// if (!isEmpty(app.viewModel.keywords())) {

		// 	var keywords = '(';
		// 	var count = 0;
		// 	$.each(app.viewModel.keywords(), function(key, val){
		// 		if (count > 0) {
		// 			keywords = keywords + ' AND ';
		// 		}
		// 		keywords = keywords + key;
		// 		count++;
		// 	});

		// 	keywords = keywords + ')';

		// 	if (keywords.length > 0) {
		// 	   app.viewModel.q_query(app.viewModel.q_query() + "keywords: " + keywords + " "); 
		// 	}
		// }
	};

	$scope.getBoundingBox = function () {
		return '';
		// if (app.viewModel.useBb() && app.viewModel.bbLat() != "" && app.viewModel.bbLon() != "") {
		// 	app.viewModel.fq_query("{!bbox pt=" + app.viewModel.bbLat() + "," + app.viewModel.bbLon() + " sfield=envelope_geo d=0.001} ");
		// } else {
		// 	app.viewModel.fq_query("");
		// }		
	};

	$scope.watchPageIndex = function () {
		$scope.unwatchPageIndex_internal = $scope.$watch('pageIndex', function (newValue) {
			$scope.runQuery($scope.filterValues, false);
		});		
	};

	$scope.unwatchPageIndex = function () {
		if ($scope.unwatchPageIndex_internal) {
			$scope.unwatchPageIndex_internal();
		}
	};

	$scope.onLoad();
}]);