(function () {
    'use strict';

    google.charts.load('current', {'packages': ['bar']});


    angular.module('app').controller('dashboard', function ($q, model, surveys) {
        var that = this,
            chart = new Chart(document.getElementById('tags-chart')),
            oldState;

        model.tagsTable = new Table(document.getElementById('tags-table'));
        model.termsTable = new Table(document.getElementById('terms-table'));
        this.maxTags = 10;
        this.minRepeat = 3;


        $('.nav-body').hide();
        surveys.loadSurveys().success(function () {
            that.navigate('surveys');
            that.surveys = surveys.surveys;
        });


        this.navigate = function (state) {
            if (oldState) {
                $('[data-active=' + oldState + ']').removeClass('active');
                $('#' + oldState).hide();
            }
            $('[data-active=' + state + ']').addClass('active');
            $('#' + state).show();
            oldState = state;

            switch (state) {
                case 'chart':
                    if (model.tagsArr.length) {
                        chart.create(model.gData);
                    }
                    else {
                        alert('Tags loaded already?');
                    }
                    break;
            }
        };


        function stepTwo () {
            that.navigate('tags');
            that.filterTags(true);
        }

        
        this.filterTags = function (reset) {
            model.splitTags(this.maxTags, this.minRepeat, reset);
        };

        
        this.loadSurveyById = function (id) {
            this.navigate('tags');
            this.surveyId = id;
            model.getTagsBySurveyId(id).success(function () {
                model.tagsTable.create(model.tagsArr, true);
            });
            model.getTermsBySurveyId(id).success(function () {
                model.termsTable.create(model.termsArr, true);
            });
        };


        this.deleteSurveyById = function (id) {
            if (confirm('Do you really want to delete this survey and all its data?')) {  //todo bootstrap
                surveys.deleteSurvey(id);
                if (id === model.surveyId) {
                    that.tagsPresent = false;
                }
            }
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
                        bootstrapConfirm(msg, 'Add as new', 'Overwrite', function (response) {
                            if (response === 2) {
                                that.surveyId = surveyId;
                            }
                            else {
                                that.surveyId = undefined;
                            }
                            model.initByExcel(workbook);
                            stepTwo();
                        });
                    }
                    else {
                        that.surveyId = undefined;
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
                                model.addSubTerms(from.index, to.index);
                                model.deleteTag(from.index);
                            }
                            else {
                                line = model.deleteSubTerm(from.index, from.html);
                                model.addSubTerm(to.index, line[0], line[1]);
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
                            model.addTerms(line);
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
                if (to.target === 'TR') {
                    model.addSubTerm(to.index, line[0], line[1]);
                }
                else {
                    model.addTag(line);
                }
            }
            else {
                return false;
            }
        };
        
        
        this.sort = function () {
            model.sort(model.tagsArr);
            model.sort(model.termsArr);
            setTimeout(function () {
                model.tagsTable.update(model.tagsArr);
                model.termsTable.update(model.termsArr);
            }, 0);
        };
        
        
        this.save = function () {
            //this.sort();
            if (this.surveyId) {
                model.overwriteSurvey(this.surveyId).success(function () {
                    that.navigate('chart');
                });
            }
            else {
                model.saveNewSurvey().then(function (id) {
                    that.surveyId = id;
                    surveys.addSurvey(model.surveyId, model.surveyData);
                    that.navigate('chart');
                });
            }
        }; 


        this.deleteSurveyById = function (id) {
            if (confirm('Do you really want to delete this survey and all its data?')) {  //todo bootstrap
                surveys.deleteSurvey(id);
            }
        };

    });
})();