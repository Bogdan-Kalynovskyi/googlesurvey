
    google.charts.load('44', {'packages': ['bar']});


    app.controller('dashboard', ['model', 'surveys', '$rootScope', '$q', function (model, surveys, $rootScope, $q) {
        function byId(id) {
            return document.getElementById(id);
        }

        var that = this,
            dupe = false,
            chart = new Chart(byId('tags-chart')),
            oldState,
            trash;


        model.tagsTable = new Table(byId('tags-table'));
        model.termsTable = new Table(byId('terms-table'));
        this.maxTags = 10;


        surveys.load().success(function () {
            $('#loading').remove();
            that.navigate('surveys');
            that.surveys = surveys.surveys;
        });


        window.addEventListener('resize', function () {
            if (oldState === 'chart') {
                chart.update();
            }
        }, 100);


        this.navigate = function (state) {
            if (state !== 'surveys' && !(model.tagsArr || this.sId)) {
                alert('Nothing to display, survey not loaded yet');
                return;
            }

            if (oldState) {
                byId('btn-' + oldState).classList.remove('active');
                byId(oldState).style.display = 'none';
            }
            byId('btn-' + state).classList.add('active');
            byId(state).style.display = 'block';
            oldState = state;

            if (state === 'chart') {
                chart.create(model.tagsArr, surveys.surveys[this.sId]);
                var table = new SimpleTable(byId('chart-table'));
                table.create(model.tagsArr);
            }
        };


        function stepTwo (question) {
            that.filterTerm = '';
            trash = [];
            that.navigate('tags');
            that.splitMax(true);
            byId('tags-question').innerHTML = question;
        }

        
        this.splitMax = function (reset) {
            if (this.maxTags) {
                this.minRepeat = model.splitMax(this.maxTags, reset);
                saveAll();
            }
        };

        this.splitMin = function () {
            this.maxTags = model.splitMin(this.minRepeat);
            saveAll();
        };

        
        this.loadSurvey = function (id) {
            this.sId = id;
            this.filterTerm = '';
            trash = [];
            this.navigate('tags');
            byId('tags-question').innerHTML = surveys.surveys[this.sId].question;
            total = +surveys.surveys[id].total;
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
                        surveyId = surveys.findByGoogleId(overview.A2.w),
                        msg = 'Survey with this id has already been uploaded. Do you want to overwrite existing one or add as a new survey?';

                    if (surveyId !== -1) {
                        bootstrapConfirm(msg, 'Add as new', 'Overwrite', function (response) {
                            if (response === 2) {
                                that.sId = surveyId;
                            }
                            else {
                                that.sId = undefined;
                            }
                            stepTwo(model.initByExcel(workbook));
                        });
                    }
                    else {
                        that.sId = undefined;
                        stepTwo(model.initByExcel(workbook));
                    }
                };

                reader.readAsBinaryString(file);
            }
        };


        this.addTags = function () {
            var arr = [];
            this.bulkAdd.toLowerCase().split(',').forEach(function (el) {
                var word = el.trim();
                if (word.length) {
                    arr.push([word, 0]);
                }
            });
            this.bulkAdd = '';

            model.addTags(arr);
            model.tagsTable.update(model.tagsArr);
            saveAll();
        };


        this.updateTag = function () {
            model.updateTag.apply(model, arguments);
            saveAll();
        };


        this.deleteRow = function (index, isTagsTable) {
            if (isTagsTable) {
                total -= model.tagsArr[index][1];
                var trashId = trash.push([model.tagsArr[index], isTagsTable]) - 1;
                model.deleteTag(index, trashId);
            }
            else {
                total -= model.termsArr[index][1];
                var trashId = trash.push([model.termsArr[index], isTagsTable]) - 1;
                model.deleteTerm(index, trashId);
            }
            model.tagsTable.updatePerc(model.tagsArr);
            model.termsTable.updatePerc(model.termsArr);
            saveAll();
        };


        this.deleteSyn = function (index, name) {
            var syn = model.deleteSyn(index, name);
            total -= syn[1];
            model.tagsTable.updatePerc(model.tagsArr);
            model.termsTable.updatePerc(model.termsArr);
            saveAll();
        };


        this.undoRow = function (id) {
            var restore = trash[id];
            if (restore[1]) {
                model.addTag(restore[0]);
            }
            else {
                model.addTerm(restore[0]);
            }
            total += restore[0][1];
            model.tagsTable.updatePerc(model.tagsArr);
            model.termsTable.updatePerc(model.termsArr);
            saveAll();
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
                                line = model.deleteSyn(from.index, from.html);
                                model.addSubTerm(to.index, line[0], line[1]);
                            }
                        }
                        else {
                            if (from.isSynonym) {
                                line = model.deleteSyn(from.index, from.html);
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
                        line = model.deleteSyn(from.index, from.html);
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
            saveAll();
        }


        this.dragTag = function (from, to) {
            var fromTable = from.isTagsTable ? model.tagsTable : model.termsTable,
                selected = fromTable.selectedIndexes(),
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
            model.sort(model.termsArr);
            setTimeout(function () {
                model.termsTable.update(model.termsArr);
            }, 0);
        };


        this.filterTerms = function () {
            model.filterTerms(this.filterTerm);
        };


        // this.clearFilter = function () {
        //     this.filterTerm = '';
        //     $('#terms-table thead input')[0].checked = false;
        //     //ctrl.filterTerms()
        // };
        

        var saveTimeout;

        function saveAll () {
            clearTimeout(saveTimeout);

            saveTimeout = setTimeout(function () {
                if (that.sId && !dupe) {
                    that.surveys[that.sId].total = total;
                    model.overwriteSurvey(that.sId);
                }
                else {
                    dupe = false;
                    model.saveNewSurvey().then(function (id) {
                        that.sId = id;
                        surveys.add(model.surveyId, model.surveyData);
                    });
                }
            }, 600);
        }


        this.downloadCsv = function () {
            var fileName = 'tags_' + surveys.surveys[this.sId].survey_google_id + '.csv';

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
                if (id === this.sId) {
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