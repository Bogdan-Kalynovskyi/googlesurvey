(function () {
    'use strict';

    google.charts.load('current', {'packages': ['bar']});


    angular.module('app').controller('dashboard', function ($q, model, surveys) {
        var that = this;


        model.tagsTable = new Table(document.getElementById('tags-table'));
        model.termsTable = new Table(document.getElementById('terms-table'));
        

        surveys.loadSurveys().success(function () {
            that.state = 'surveys';
            that.surveys = surveys.surveys;
        });


        this.navigate = function (state) {
            this.state = state;

            switch (state) {
                case 'surveys':
                    surveys.loadSurveys().success(function () {
                        that.surveys = surveys.surveys;
                    });
                    break;
                case 'chart':
                    chart.create(model.arrToGoo(model.tagsArr));
                    break;
            }
        };


        function stepTwo () {
            that.navigate('tags');
            that.filterTags();
        }

        
        this.filterTags = function () {
            model.splitTags(that.maxTags, that.minRepeat);
            model.tagsTable.create(model.tagsArr);
            model.termsTable.create(model.termsArr);
        };

        
        this.loadSurveyById = function (id) {
            this.navigate('tags');
            this.surveyId = id;
            model.getTagsBySurveyId(id).success(function () {
                model.tagsTable.create(model.tagsArr);
            });
            model.getTermsBySurveyId(id).success(function () {
                model.termsTable.create(model.termsArr);
            });
        };


        this.uploadFile = function (event) {
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var workbook = XLS.read(e.target.result, {type: 'binary'}),
                        overview = workbook.Sheets.Overview,
                        surveyId = surveys.findByGoogleId(overview.A2.w),
                        msg = 'Survey with this id has already been uploaded. Do you want to overwrite existing one or add as a new survey?';

                    if (surveyId !== -1) {
                        bootstrapConfirm(msg, 'Create new', 'Overwrite', function (response) {
                            if (response === 2) {
                                that.surveyId = surveyId;
                            }
                            model.initByExcel(workbook);
                            stepTwo();
                        });
                    }
                    else {
                        model.initByExcel(workbook);
                        stepTwo();
                    }
                };

                reader.readAsBinaryString(file);
            }
        };


        this.addTags = function (str) {
            var arr = [];
            str.toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/).forEach(function (el) {
                var word = el.trim();
                if (word.length) {
                    arr.push([word, 0]);
                }
            });

            model.addTags(arr);
            model.tagsTable.update(model.tagsArr);
        };


        this.updateTag = function () {
            model.updateTag.apply(model, arguments);
        };


        this.dragTag = function (from, to) {
            var line;
            
            if (from.table === 'tags-table') {
                if (to.table === 'tags-table') {
                    if (from.index !== to.index) {
                        if (to.target !== 'THEAD') {
                            if (from.target === 'SPAN') {
                                line = model.tagsArr[from.index];
                                if (line[2]) {
                                    model.strToArr(line).forEach(function (el) {
                                        model.addSubTerm(to.index, el);
                                    });
                                    line.splice(2, 2);
                                }
                                model.addSubTerm(to.index, line);
                                model.deleteTag(from.index);
                            }
                            else {
                                line = model.deleteSubTerm(from.index, from.html);
                                model.addSubTerm(to.index, line);
                            }
                        }
                        else {
                            if (from.target === 'LI') {
                                line = model.deleteSubTerm(from.index, from.html);
                                model.addTag(line);
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (from.target === 'SPAN') {
                        line = model.tagsArr[from.index];
                        if (line[2]) {
                            model.addTerms(model.strToArr(line));
                            line.splice(2, 2);
                        }
                        model.deleteTag(from.index);
                    }
                    else {
                        line = model.deleteSubTerm(from.index, from.html);
                    }
                    model.addTerm(line);
                }
            }
            else if (to.table === 'tags-table') {
                line = model.termsArr[from.index];
                model.deleteTerm(from.index);
                if (to.target === 'LI') {
                    model.addSubTerm(to.index, line);
                }
                else {
                    model.addTag(to.index, line);
                }
            }
            else {
                return false;
            }
        };
        
        
        this.sort = function () {
            model.sort(model.tagsArr);
            model.sort(model.termsArr);
            model.tagsTable.update(model.tagsArr);
            model.termsTable.update(model.termsArr);
        };
        
        
        this.save = function () {
            if (this.surveyId) {      
                this.overwriteSurvey(this.surveyId).success(this.navigate.bind(this, 'chart'));
            }
            else {
                this.saveNewSurvey().success(this.navigate.bind(this, 'chart'));
            }
        }; 


        this.deleteSurveyById = function (id) {
            if (confirm('Do you really want to delete this survey and all its data?')) {  //todo bootstrap
                surveys.deleteSurvey(id);
            }
        };

    });
})();