
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

	$scope.onLoad = function () {
		solr.getRecordCount(function (count) {
			$scope.recordCount = count;
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
		};

		var error = function (data) {
			$scope.resultsData = {};
			$scope.numFound = 0;
			$scope.filtersAreActive = $scope.checkFiltersAreActive(data.filterVals);
			if (console) {console.log("Error querying Solr:" + data.error.msg || "no info available"); }
		};

		solr.getResultsForQueryString($scope.resultsPerPage, $scope.pageIndex, success, error);
	};

	$scope.checkFiltersAreActive = function (filterVals) {
		return !!(filterVals && (filterVals.text || filterVals.latLng));
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