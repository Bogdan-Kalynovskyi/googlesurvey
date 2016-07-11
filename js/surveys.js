(function () {
    'use strict';

    angular.module('app').service('surveys', function ($http) {
        var that = this,
            api = 'api/surveys.php';
        
        
        this.loadSurveys = function () {
            return $http.get(api).success(function (response) {
                that.surveys = response;
            });
        };


        this.addSurvey = function  (id, survey) {
            if (!this.surveys) {
                this.surveys = {};
            }
            this.surveys[id] = survey;
        };


        this.deleteSurvey = function  (id) {
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