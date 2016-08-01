
    google.charts.load('44', {'packages': ['bar']});


    app.controller('dashboard', ['model', 'surveys', '$rootScope', '$q', function (model, surveys, $rootScope, $q) {
        var that = this,
            surveyId,
            dupe = false,
            chart = new Chart(document.getElementById('tags-chart')),
            oldState;

        model.tagsTable = new Table(document.getElementById('tags-table'));
        model.termsTable = new Table(document.getElementById('terms-table'));
        this.maxTags = 10;


        $('.nav-body').hide();
        surveys.load().success(function () {
            that.navigate('surveys');
            that.surveys = surveys.surveys;
        });


        this.navigate = function (state) {
            if (state !== 'surveys' && !(model.tagsArr || surveyId)) {
                alert('Nothing to display, survey not loaded yet');
                return;
            }

            if (oldState) {
                $('[data-active=' + oldState + ']').removeClass('active');
                $('#' + oldState).hide();
            }
            $('[data-active=' + state + ']').addClass('active');
            $('#' + state).show();
            oldState = state;

            if (state === 'chart') {
                chart.create(model.tagsArr, surveys.surveys[surveyId]);
                var table = new SimpleTable(document.getElementById('chart-table'));
                table.create(model.tagsArr);
            }
        };


        function stepTwo () {
            that.navigate('tags');
            that.filterMax(true);
            $('#tags-question').html(surveys.surveys[surveyId].question);
        }

        
        this.filterMax = function (reset) {
            this.minRepeat = model.splitMax(this.maxTags, reset);
            save();
        };

        this.filterMin = function () {
            this.maxTags = model.splitMin(this.minRepeat);
            save();
        };

        
        this.loadSurvey = function (id) {
            surveyId = id;
            this.navigate('tags');
            $('#tags-question').html(surveys.surveys[surveyId].question);
            window.total = +surveys.surveys[id].total;
            model.getTagsBySurveyId(id).success(function () {
                model.tagsTable.create(model.tagsArr, true);
                that.maxTags = model.tagsArr.length;
                that.minRepeat = model.tagsArr[that.maxTags - 1][1];
            });
            model.getTermsBySurveyId(id).success(function () {
                model.termsTable.create(model.termsArr, true);
            });
        };


        this.duplicateSurvey = function (id) {
            this.loadSurvey(id);
            model.surveyData = surveys.surveys[id];
            dupe = true;
        };


        this.uploadFile = function (event) {
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var workbook = XLS.read(e.target.result, {type: 'binary'}),
                        overview = workbook.Sheets.Overview,
                        sId = surveys.findByGoogleId(overview.A2.w),
                        msg = 'Survey with this id has already been uploaded. Do you want to overwrite existing one or add as a new survey?';

                    if (sId !== -1) {
                        bootstrapConfirm(msg, 'Add as new', 'Overwrite', function (response) {
                            if (response === 2) {
                                surveyId = sId;
                            }
                            else {
                                surveyId = undefined;
                            }
                            model.initByExcel(workbook);
                            stepTwo();
                        });
                    }
                    else {
                        surveyId = undefined;
                        model.initByExcel(workbook);
                        stepTwo();
                    }
                };

                reader.readAsBinaryString(file);
            }
        };


        this.addTags = function (str) {
            var arr = [];
            str.toLowerCase().split(',').forEach(function (el) {
                var word = el.trim();
                if (word.length) {
                    arr.push([word, 0]);
                }
            });

            model.addTags(arr);
            model.tagsTable.update(model.tagsArr);
            save();
        };


        this.updateTag = function () {
            model.updateTag.apply(model, arguments);
            save();
        };


        this.deleteLine = function (index, isTagsTable) {
            if (isTagsTable) {
                window.total -= model.tagsArr[index][1];
                model.deleteTag(index);
            }
            else {
                window.total -= model.termsArr[index][1];
                model.deleteTerm(index);
            }
            model.tagsTable.updatePerc(model.tagsArr);
            model.termsTable.updatePerc(model.termsArr);
            save();
        };


        function calcDrop (from, to) {
            var line;
            
            if (from.isTagsTable) {
                if (to.isTagsTable) {
                    if (from.index !== to.index) {
                        if (to.isRow) {
                            if (!from.isSynonym) {
                                model.addSubTerms(from.index, to.index);
                                model.deleteTag(from.index);
                            }
                            else {
                                line = model.deleteSubTerm(from.index, from.html);
                                model.addSubTerm(to.index, line[0], line[1]);
                            }
                        }
                        else {
                            if (from.isSynonym) {
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
                    if (!from.isSynonym) {
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
            else if (to.isTagsTable) {
                line = model.termsArr[from.index];
                model.deleteTerm(from.index);
                if (to.isRow) {
                    model.addSubTerm(to.index, line[0], line[1]);
                }
                else {
                    model.addTag(line);
                }
            }
            else {
                return false;
            }
            save();
        }


        this.dragTag = function (from, to) {
            var table = from.isTagsTable ? model.tagsTable : model.termsTable,
                selected = table.selectedIndexes(),
                n = selected.length;

            if (n) {
                var newFrom = {
                        isTagsTable: from.isTagsTable,
                        isSynonym: false
                    };

                while (n--) {
                    newFrom.index = selected[n];
                    calcDrop(newFrom, to);
                }
            }
            else {
                calcDrop(from, to);
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


        this.filterTerms = function () {
            model.filterTerms(this.filterTerm);
        };
        

        var saveTimeout;

        function save () {
            clearTimeout(saveTimeout);

            saveTimeout = setTimeout(function () {
                if (surveyId && !dupe) {
                    that.surveys[surveyId].total = total;
                    model.overwriteSurvey(surveyId);
                }
                else {
                    dupe = false;
                    model.saveNewSurvey().then(function (id) {
                        surveyId = id;
                        surveys.add(model.surveyId, model.surveyData);
                    });
                }
            }, 900);
        }


        this.downloadCsv = function () {
            var fileName = surveys.surveys[surveyId].survey_google_id + '.csv';

            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(chart.csvBlob, fileName);
            }
            else {
                var link = document.createElement("a");
                if (link.download !== undefined) { // feature detection
                    var url = URL.createObjectURL(chart.csvBlob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', fileName);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(function () {
                        document.body.removeChild(link);
                    }, 10000);
                }
                else {
                    var csvWin = window.open('', '', '');
                    csvWin.document.write('<meta name=content-type content=text/csv><meta name=content-disposition content="attachment;  filename=' + fileName + '">  ');
                    csvWin.document.write(chart.csvStr);
                }
            }
        };


        this.deleteSurveyById = function (id) {
            if (confirm('Do you really want to delete this survey and all its data?')) {  //todo bootstrap
                surveys.delete(id);
                if (id === surveyId) {
                    $('tr[ondragover]').remove();
                    $('#tags-chart').html('');
                }
            }
        };


        this.logOut = function () {
            $q.all([model.logOut(), gapi.auth2.getAuthInstance().signOut()]).then(function () {
                location.reload();
            });
        }
    }]);