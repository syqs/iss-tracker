'use strict';

angular.module('myApp', [
  'ui.router',
  'ngMaterial'
])

.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

  $mdThemingProvider.theme('default')
  .primaryPalette('lime')
  .accentPalette('orange')
  .dark();

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'SpaceController'
    })
    .state('map', {
      url: '/',
      cache: false,
      templateUrl: 'views/map.html',
      controller: 'MapController'
    })

})
