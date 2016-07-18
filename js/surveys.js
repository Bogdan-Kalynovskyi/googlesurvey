(function () {
    'use strict';

    angular.module('app').service('surveys', function ($http) {
        var that = this,
            api = 'api/surveys.php';
        
        
        this.load = function () {
            return $http.get(api).success(function (response) {
                that.surveys = response || {};
            });
        };


        this.add = function  (id, survey) {
            this.surveys[id] = survey;
        };


        this.updateTotal = function  (id) {
            return $http.put(api + '?surveyId=' + id, {total: total}).success(function () {
                that.surveys[id].total = total;
            });
        };


        this.delete = function  (id) {
            return $http.delete(api + '?surveyId=' + id).success(function () {
                delete that.surveys[id];
            });
        };


        this.findByGoogleId = function (googleId) {
            for (var i in this.surveys) {
                if (this.surveys[i].survey_google_id === googleId) {
                    return i;
                }
            }
            return -1;
        };
        
    });
})();