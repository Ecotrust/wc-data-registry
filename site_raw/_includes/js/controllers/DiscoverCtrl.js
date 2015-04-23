
angular.module('wcodpApp').controller('DiscoverCtrl', ['$scope', '$http', '$location', '$timeout', 'solr', function($scope, $http, $location, $timeout, solr) { 
	$scope.resultsData = {};
	$scope.numFound = 0;
	$scope.startIndex = 0;
	$scope.pageIndex = 1;
	$scope.pageIndexWatchInitialized = false;
	$scope.resultsPerPage = 5;
	$scope.resultsPerPageWatchInitialized = false;
	$scope.queryStringWatchInitialized = false;
	$scope.filtersAreActive = false;
	$scope.showingMobileFiltersModal = false;
		$scope.browseAll = false;

	$scope.onLoad = function () {
		// Get total record count and initial filter option lists & counts.
		solr.query({text: '* '}, 1, 1, function (data) {
			$scope.recordCount = data.response.numFound;
			$scope.facets = data.facet_counts;
		}, function (data) {
			if (console) console.log('Failed to get record count and filter options.');
		});

		$scope.watchQueryString();
		$scope.watchResultsPerPage();
		$scope.watchPageIndex();
	};

	$scope.resetPagination = function () {
		// Unwatch to avoid causing a new query.
		$scope.unwatchPageIndex();
		$scope.pageIndex = 1;
		$scope.watchPageIndex();
	};
		
	$scope.runQuery = function () {

		var success = function (data) {
			// Fill UI with results.
			$scope.resultsData = data.response.docs;
			$scope.numFound = data.response.numFound;
			$scope.filtersAreActive = $scope.checkFiltersAreActive(data.filterVals);
			$scope.facets = data.facet_counts;
		};

		var error = function (data) {
			$scope.resultsData = {};
			$scope.numFound = 0;
			$scope.filtersAreActive = $scope.checkFiltersAreActive(data.filterVals);
			$scope.facets = undefined;
			if (console) { console.log("Error querying Solr:" + data.error.msg || "no info available"); }
		};
		solr.getResultsForQueryString($scope.resultsPerPage, $scope.pageIndex, success, error);
	};

	$scope.searchAll = function () {

		var success = function (data) {
			// Fill UI with results.
			$scope.resultsData = data.response.docs;
			$scope.numFound = data.response.numFound;
			$scope.filtersAreActive = $scope.checkFiltersAreActive(data.filterVals);
			$scope.facets = data.facet_counts;
		};

		var error = function (data) {
			$scope.resultsData = {};
			$scope.numFound = 0;
			$scope.filtersAreActive = $scope.checkFiltersAreActive(data.filterVals);
			$scope.facets = undefined;
			if (console) { console.log("Error querying Solr:" + data.error.msg || "no info available"); }
		};

		solr.getAllResults($scope.resultsPerPage, $scope.pageIndex, success, error);

		$scope.browseAll = true;
	};

	$scope.countFilter = function(val, index){
		return (val.count > 0);
	};

	$scope.checkFiltersAreActive = function (filterVals) {
		return (filterVals && (filterVals.text 
							   || filterVals.latLng 
							   || (filterVals.categories && filterVals.categories.length > 0) 
							   || (filterVals.issues && filterVals.issues.length > 0) 
							   || (filterVals.sources && filterVals.sources.length > 0)
							   || (filterVals.formats && filterVals.formats.length > 0)
				));
	};

	$scope.getQueryString = function () {
		var qs = "";
		_.each($location.search(), function (val) {
			qs = qs + val;
		});
		return qs;
	};

	$scope.watchQueryString = function () {
		$scope.$watch('getQueryString()', function (newValue, oldValue) {
			$scope.resetPagination();					
			$scope.runQuery();
		});
	};

	$scope.watchPageIndex = function () {
		$scope.unwatchPageIndex();
		$scope.unwatchPageIndex_internal = $scope.$watch('pageIndex', function (newValue) {
			if ($scope.pageIndexWatchInitialized) {
				$scope.runQuery();
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
				$scope.resetPagination();
				$scope.runQuery();
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
