
angular.module('wcodpApp').controller('DiscoverCtrl', ['$scope', '$http', '$location', '$timeout', 'solr', function($scope, $http, $location, $timeout, solr) { 
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
			location: {
				lat: $location.search().lat,
				lng: $location.search().lng
			}
		};
		$scope.filterValues = initialFilterValues;
		$scope.watchResultsPerPage();
		$scope.watchPageIndex();

		solr.getRecordCount(function (count) {
			$scope.recordCount = count;
		});
	};

	$scope.onSolrSuccess = function (data) {
		$scope.updateUrl(data.filterValues);
		// Fill UI with results.
		$scope.resultsData = data.response.docs;
		$scope.numFound = data.response.numFound;
		if (console) console.log('Solr Success');
	};

	$scope.onSolrError = function (data) {
		$scope.updateUrl(data.filterValues);
		$scope.resultsData = {};
		$scope.numFound = 0;
		if (console) {console.log("Error querying Solr:" + data.error.msg || "no info available"); }
	};

	/**
	 * Udates URL without a reload. Does not create a new entry in browser 
	 * history.
	 * @param  {object} filterValues Values used in query.
	 */
	$scope.updateUrl = function (filterValues) {
		var vals = filterValues;
		if (vals.searchText) {
			$location.search('text', vals.searchText);
		} else {
			$location.search('text', null); // clear
		}

		if (vals.location && vals.location.lat && vals.location.lng) {
			$location
				.search('lat', vals.location.lat)
				.search('lng', vals.location.lng);
		} else {
			$location.search('lat', null).search('lng', null); // clear
		}
	};

	$scope.runQuery = function (filterVals, resetPagination) {
		if (resetPagination) {
			$scope.unwatchPageIndex();
			$scope.pageIndex = 1;
			$scope.watchPageIndex();
		}
		$scope.filterValues = filterVals;
		solr.querySolr($scope.filterValues, 
			$scope.resultsPerPage, 
			$scope.pageIndex, 
			$scope.onSolrSuccess, 
			$scope.onSolrError);
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