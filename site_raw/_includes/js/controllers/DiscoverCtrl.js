
angular.module('wcodpApp').controller('DiscoverCtrl', ['$scope', '$http', '$location', '$timeout', 'solr', function($scope, $http, $location, $timeout, solr) { 
	$scope.solrUrl = '/solr/collection1/select?';
	$scope.filterValues = {};
	$scope.resultsData = {};
	$scope.numFound = 0;
	$scope.startIndex = 0;
	$scope.location = null;
	$scope.pageIndex = 1;
	$scope.pageIndexWatchInitialized = false;
	$scope.resultsPerPage = 5;
	$scope.resultsPerPageWatchInitialized = false;

	$scope.onLoad = function () {
		// Populate filter values from parameters in the URL.
		var initialFilterValues = {
			searchText: $location.search().text,
		};
		$scope.filterValues = initialFilterValues;
		$scope.watchResultsPerPage();
		$scope.watchPageIndex();

		solr.getRecordCount(function (count) {
			$scope.recordCount = count;
		});
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
			'fq': $scope.getBoundingBoxQuery(filterValues.location),
			//'fl': 'contact.organizations_ss, id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt, url.metadata_s, sys.src.item.uri_s, sys.sync.foreign.id_s',
			'fl': '',
			'facet': true,
			'facet.field': facetFields,
			'facet.mincount': facetMinCounts
		};

		// Execute query.
		if (console) { console.log("Querying Solr"); }
		$http.get($scope.solrUrl, queryConfig).success(function (data, status, headers, config) {
			$location
				.search('text', $scope.getSearchText())
				//.search('location', $scope.)
				.replace();
			$scope.resultsData = data.response.docs;
			$scope.numFound = data.response.numFound;
		}).error(function (data, status, headers, config) {
			$scope.resultsData = {};
			$scope.numFound = 0;
			//if (console) {console.log("Error querying Solr:" + data.error.msg || "no info available"); }
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
			val = $scope.getSearchText(),
			applyingOtherFilters = false;

		applyingOtherFilters = $scope.filterValues.location != null;

		q = val.length > 0 ? q + val + " " : applyingOtherFilters ? "* " : " "; //q + "* ";
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

	$scope.getBoundingBoxQuery = function (centerPoint) {
		if (centerPoint && centerPoint.lat && centerPoint.lng) {
			return "{!bbox pt=" + centerPoint.lat + "," + centerPoint.lng + " sfield=envelope_geo d=0.001} ";
		} else {
			return "";
		}
	};

	$scope.watchPageIndex = function () {
		$scope.unwatchPageIndex();
		$scope.unwatchPageIndex_internal = $scope.$watch('pageIndex', function (newValue) {
			if ($scope.pageIndexWatchInitialized) {
				if (console) { console.log('pageIndex changed to: ' + newValue); }
				$scope.runQuery($scope.filterValues, false);
			} else {
				// Doing this to avoid duplicate queries to the server.
				$timeout(function () { $scope.pageIndexWatchInitialized = true; }, 1);
			}
		});
	};

	$scope.unwatchPageIndex = function () {
		if ($scope.unwatchPageIndex_internal) {
			$scope.unwatchPageIndex_internal();
			$scope.pageIndexWatchInitialized = false;
		}
	};

	$scope.watchResultsPerPage = function () {
		$scope.unwatchResultsPerPage();
		$scope.unwatchResultsPerPage_internal = $scope.$watch('resultsPerPage', function (newValue) {
			if ($scope.resultsPerPageWatchInitialized) {
				if (console) {console.log('resultsPerPage changed to: ' + newValue); }
				$scope.runQuery($scope.filterValues, true);
			} else {
				// Doing this to avoid duplicate queries to the server.
				$timeout(function () { $scope.resultsPerPageWatchInitialized = true; }, 1);
			}
		});
	};

	$scope.unwatchResultsPerPage = function () {
		if ($scope.unwatchResultsPerPage_internal) {
			$scope.unwatchResultsPerPage_internal();
			$scope.resultsPerPageWatchInitialized = false;
		}
	};


	$scope.onLoad();	
}]);