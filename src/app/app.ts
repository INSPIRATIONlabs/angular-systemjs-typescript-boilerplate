'use strict';
import 'core-js/shim';
import 'jquery';
import  angular from 'angular';

import router from 'oclazyload-systemjs-router';
import futureRoutes from 'app/routes.json!';

var appModule = angular.module('app', []);

appModule.config(router(appModule, futureRoutes));

appModule.config(['$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider',
  function($stateProvider, $locationProvider, $httpProvider,
    $urlRouterProvider) {
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
    $httpProvider.useApplyAsync(false);
    return $urlRouterProvider.otherwise('/home');
}]);

appModule.controller('AppCtrl', [
  function() {

  }
]);

angular.element(document).ready(function() {
    return angular.bootstrap(document.body, [appModule.name], {
        strictDi: false
    });
});


export default appModule;
