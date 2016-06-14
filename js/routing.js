(function () {
    'use strict';

    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {
                
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url: '/',
            controller: 'UploadCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'templates/file-upload.html'
        });
        
    });
})();