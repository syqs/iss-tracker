'use strict';
angular.module('myApp')

//Map controller
.controller('MapController', function($scope, $timeout, $http) {

  $scope.map;
  $scope.iss = {};
  $scope.tweets = [];
  var counter = 0;

  // Initialization  
  $scope.$on('$viewContentLoaded', function() {
    $scope.getIssLoc();  
    $scope.getTwitterFeeds();
  })

  // Callback for seting the map to the state
  $scope.mapCreated = function(map) {
    $scope.map = map;
  };

  // Get twitter data 
  $scope.getTwitterFeeds = function() {

    // Initiate a call to backend
    $http.get("/api")
      .then(function(feeds) {
        $scope.tweets = feeds.data.statuses
      })
      .catch(function(err) {
        console.log('error: ', err)
      })
  }

  // Draw the map 
  $scope.drawMap = function(){
    var lat;
    var lng;
    if ($scope.iss.location){
      lat = $scope.iss.location.latitude;
      lng = $scope.iss.location.longitude;
    }else{
      lat =  -31.54961366315104;
      lng = -105.60398630491167;
    }
    var latlng = new google.maps.LatLng(lat, lng);
    var myOptions = {
      zoom: 2,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), myOptions);
  }

  // Get the location of ISS
  $scope.getIssLoc = function() {
    if(counter<2){
      $scope.drawMap();
      counter++
    }

    // Initiate a call to back end
    $http.get("/issLocation")
      .then(function(location) {
        $scope.iss.location = location.data.iss_position;
        if(!location.data.iss_position.latitude){
          $scope.addMarker({
            lat: 'no data available',
            lng: '...'
          })
        }else{

          // Create a marker with latest position
          $scope.addMarker({
            lat: location.data.iss_position.latitude,
            lng: location.data.iss_position.longitude
          })
        }
      })
      .catch(function(err) {
        console.log('error: ', err)
      })
  }

  $scope.showTweets = true;
  $scope.closeTweets = function(){
    console.log($scope.showTweets)
    $scope.showTweets = ($scope.showTweets) ? false : true;
  }

  //Add single Marker
  $scope.addMarker = function(pos) {
    var icons = 'images/iss-ico.png'
    var marker = new google.maps.Marker({
      position: {
        lat: pos.lat,
        lng: pos.lng
      },
      icon: icons
    });
    
    // Put marker on the map
    marker.setMap($scope.map);
  }

  // Run these periodically
  setInterval(function() {
    $scope.getIssLoc();
  }, 4000)

  setInterval(function() {
    $scope.getTwitterFeeds();
  }, 30000)

});