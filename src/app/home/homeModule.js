import angular from 'angular';
import appModule from '../app';
import homeTpl from './home.tpl';
let homeModule = angular.module('dashboardmodule', [
    appModule.name,
    homeTpl.name
]);
homeModule.config(($stateProvider) => {
    $stateProvider
        .state('home', {
        url: '/home',
        views: {
            'main': {
                templateUrl: homeTpl.name,
                controller: 'homeCtrl'
            }
        },
        data: {
            title: 'home'
        }
    });
});
export default homeModule;
