(function () {
    'use strict';

    google.charts.load('current', {'packages': ['bar']});


    angular.module('app').controller('Dashboard', function (model) {
        var that = this,
            table = new Table(document.getElementById('tags-table')),
            chart = new Chart(document.getElementById('tags-barchart'));


        this.loadBySurveyId = function () {
            model.initBySurveyId(that.surveyId).success(function () {
                google.charts.setOnLoadCallback(function () {
                    table.create(model.tagsArr);
                    chart.create(model.tagsGoo);
                });
            });
        };


        this.uploadFile = function (event) {
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    // to make coding synchronous, wait for google services to load
                    google.charts.setOnLoadCallback(function () {
                        
                        model.initByExcelData(e.target.result);

                        table.create(model.tagsArr);
                        chart.create(model.tagsGoo);
                    });
                };

                reader.readAsBinaryString(file);
            }
        };
        
        
        this.deleteRows = function (index) {
            var selected = index ? [index] : table.selectedIndexes(),
                tags = [];

            for (var i = 0, len = selected.length; i < len; i++) {
                tags.push(model.tagsArr[selected[i]]);
                table.deleteRow(selected[i]);
            }

            model.deleteTags(selected);
            chart.update(model.tagsGoo);
        };
        
        
        this.mergeRows = function () {
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
        };


        this.addTags = function (str) {
            var arr = [];
            str = str.toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/);
            for (var i = 0; i < str.length; i++) {
                arr.push([str[i].trim(), 0]);
            }

            model.appendTags(arr);
            table.reset(model.tagsArr);
            chart.update(model.tagsGoo);
        };


        this.updateTag = function (index, name) {
            model.updateTag(index, name);
            table.updateRow(index, name);
            chart.update(model.tagsGoo);
        };

    });
})();