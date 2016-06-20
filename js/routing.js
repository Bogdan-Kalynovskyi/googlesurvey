(function () {
    'use strict';

    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {
                
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url: '/',
            controller: 'Dashboard',
            controllerAs: 'ctrl',
            templateUrl: 'templates/dashboard.html'
        });
        
    });
})();