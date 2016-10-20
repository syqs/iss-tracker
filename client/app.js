// 'use strict';

angular.module('myApp', [
  'ui.router'
  // 'uiGmapgoogle-maps'
])

.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'MapController'
    })

});