(function () {
    'use strict';

    angular.module('app').service('surveys', function ($http) {
        var that = this,
            api = 'api/surveys.php';
        
        
        this.loadSurveys = function () {
            return $http.get(api).success(function (response) {
                that.surveys = response ? response : {};
            });
        };


        this._addSurvey = function  (id, survey) {
            this.surveys[id] = survey;
        };


        this.deleteSurvey = function  (id) {
            return $http.delete(api + '?surveyId=' + id).success(function () {
                delete that.surveys[id];
                $('#tags-table').html();
                $('#barchart_material').html();
            });
        };
        
    });
})();