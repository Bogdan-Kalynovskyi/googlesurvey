(function () {
    'use strict';

    google.charts.load('current', {'packages': ['bar']});


    angular.module('app').controller('Dashboard', function ($q, model, surveys) {
        var that = this,
            waiting4SurveyId = $q.defer(),
            table = new Table(document.getElementById('tags-table')),
            chart = new Chart(document.getElementById('tags-barchart'));

        window.model = model;
        window.surveys = surveys;


        surveys.loadSurveys().success(function () {
            that.surveys = surveys.surveys;
        });

        
        this.loadSurveyById = function (id) {
            waiting4SurveyId = $q.defer();
            model.initBySurveyId(id).success(function () {
                google.charts.setOnLoadCallback(function () {
                    table.create(model.tagsArr);
                    chart.create(model.tagsGoo);
                    waiting4SurveyId.resolve();
                });
            });
        };

        
        this.deleteSurveyById = function (id) {
            surveys.deleteSurvey(id);
        };


        this.uploadFile = function (event) {
            waiting4SurveyId = $q.defer();
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    // to make coding synchronous, wait for google services to load
                    google.charts.setOnLoadCallback(function () {

                        model.initByExcelData(e.target.result).then(function (surveyData) {
                            surveys._addSurvey(model.surveyId, surveyData);
                            waiting4SurveyId.resolve();
                        });

                        table.create(model.tagsArr);
                        chart.create(model.tagsGoo);
                    });
                };

                reader.readAsBinaryString(file);
            }
        };
        
        
        this.deleteRows = function (index) {
            waiting4SurveyId.then(function () {
                var selected = index ? [index] : table.selectedIndexes(),
                    tags = [];

                for (var i = 0, len = selected.length; i < len; i++) {
                    tags.push(model.tagsArr[selected[i]]);
                    table.deleteRow(selected[i]);
                }

                model.deleteTags(selected);
                chart.update(model.tagsGoo);
            });
        };
        
        
        this.mergeRows = function () {
            waiting4SurveyId.then(function () {
                var selected = table.selectedIndexes(),
                    index,
                    tag = '',
                    count = 0;

                if (selected.length === 0) {
                    return;
                }

                for (var i = 0; i < selected.length; i++) {
                    index = selected[i];
                    tag += ', ' + model.tagsArr[index][0];
                    count += model.tagsArr[index][1];
                    table.deleteRow(index);
                }
                tag = tag.substr(2);

                model.deleteTags(selected);
                model.appendTags([[tag, count]]);
                table.reset(model.tagsArr);
                chart.update(model.tagsGoo);
            });
        };


        this.addTags = function (str) {
            waiting4SurveyId.then(function () {
                var arr = [];
                str = str.toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/);
                for (var i = 0; i < str.length; i++) {
                    var word = str[i].trim();
                    if (word.length) {
                        arr.push([word, 0]);
                    }
                }

                model.appendTags(arr);
                table.reset(model.tagsArr);
                chart.update(model.tagsGoo);
            });
        };


        this.updateTag = function (index, name) {
            model.updateTag(index, name);
            table.updateRow(index, name);
            chart.update(model.tagsGoo);
        };

    });
})();