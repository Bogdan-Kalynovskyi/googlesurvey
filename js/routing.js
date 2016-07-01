(function () {
    'use strict';

    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {
                
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('upload', {
                url: '/',
                templateUrl: 'templates/upload.html'
            })

            .state('tags', {
                url: '/select-tags',
                templateUrl: 'templates/select-tags.html'
            })

            .state('chart', {
                url: '/chart',
                templateUrl: 'templates/chart.html'
            });
            
            // .state('form.payment', {
            //     url: '/payment',
            //     templateUrl: 'form-payment.html'
            // });        
    });
})();