'use strict';
angular.module('myApp')

//Map controller
.controller('MapController', function($scope, $timeout, $http) {

  $scope.map;
  $scope.iss = {};
  $scope.tweets = [];

  $scope.mapCreated = function(map) {
    $scope.map = map;
  };

  //Map initialization  
  $scope.$on('$viewContentLoaded', function() {
    $scope.getIssLoc();  
    $scope.getTwitterFeeds();
  })

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

  $scope.drawMap = function(){
    console.log($scope.iss)
    var lat =  -31.54961366315104;
    var lng = -105.60398630491167;
    var latlng = new google.maps.LatLng(lat, lng);
    var myOptions = {
      zoom: 2,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), myOptions);
  }

  var counter = 0;
  $scope.getIssLoc = function() {

    if(counter<1){
      $scope.drawMap();
      counter++
    }

    $http.get("/issLocation")
      .then(function(location) {
        console.log(location)
        $scope.iss.location = location.data.iss_position;
        
        $scope.addMarker({
          lat: location.data.iss_position.latitude,
          lng: location.data.iss_position.longitude
        })
      })
      .catch(function(err) {
        console.log('error: ', err)
      })
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
    marker.setMap($scope.map);
  }

  setInterval(function() {
    $scope.getIssLoc();
  }, 4000)

  setInterval(function() {
    $scope.getTwitterFeeds();
  }, 30000)

});