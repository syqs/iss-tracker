// 'use strict';

angular.module('myApp', [
  'ui.router',
  'ngMaterial'
])

.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'SpaceController'
    })
    .state('map', {
      url: '/',
      templateUrl: 'views/map.html',
      controller: 'MapController'
    })

});