'use strict';
angular.module('myApp')

.controller('MainCtrl', ['$scope', '$http', function($scope, $http) {

	$scope.tweets = [];
	$scope.issLocation = {};

	setInterval(function() {
		$scope.getIssLoc();
	}, 4000)

	setInterval(function() {
		$scope.getTwitterFeeds();
	}, 30000)

	// Initialize the map 
	$scope.map = {
		center: {
			latitude: 30.162939,
			longitude: 10.203921
		},
		zoom: 2
	};

	// Set the initial marker
	$scope.marker = {
		id: 0,
		coords: {
			latitude: 56.162939,
			longitude: 10.203921
		}
	};

	$scope.getTwitterFeeds = function() {
		// Call the backend and get twitter data
		$http.get("/api")
			.then(function(feeds) {
				console.log(feeds)
				$scope.tweets = feeds.data.statuses
			})
			.catch(function(err) {
				console.log('error: ', err)
			})
	}

	// Function that changes location of the marker
	$scope.getIssLoc = function() {

		$http.get("/issLocation")
			.then(function(location) {
				console.log(location)
				$scope.issLocation = location.data.iss_position;
				$scope.marker.coords = {
					latitude: location.data.iss_position.latitude,
					longitude: location.data.iss_position.longitude
				}
			})
			.catch(function(err) {
				console.log('error: ', err)
			})
	}

	// Get initial data from both apis
	$scope.getTwitterFeeds();
	$scope.getIssLoc();
}]);