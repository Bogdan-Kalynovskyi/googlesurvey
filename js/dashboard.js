    var trash,
        TBL_tags = 0,
        TBL_terms = 1,
        TBL_answers = 2,
        TBL_short = 3;

    function byId(id) {
        return document.getElementById(id);
    }

    google.charts.load('44', {'packages': ['bar']});


    app.controller('dashboard', ['model', 'surveys', '$rootScope', '$q', function (model, surveys, $rootScope, $q) {

        var that = this,
            dupe = false,
            chart = new Chart(byId('tags-chart')),
            states = ['surveys', 'tags', 'answers', 'chart'],
            maxState = 0,
            oldState,

            tagsReady,
            answersReady,
            chartReady,
            surveyJustDone;

        this.maxTags = 10;


        surveys.load().success(function () {
            $('#loading').remove();
            that.navigate(0);
            that.surveys = surveys.surveys;
        });


        window.addEventListener('resize', function () {
            if (oldState === 3) {
                chart.update();
            }
        });


        function setMaxState (state) {
            maxState = state;
            byId('btn-' + states[state - 1]).classList.remove('disabled');
            byId('btn-' + states[state]).classList.remove('disabled');
            for (state++; state < states.length; state++) {
                byId('btn-' + states[state]).classList.add('disabled');
            }
        }


        this.navigate = function (state) {
            if (state > maxState) {
                if (maxState === 0) {
                    bootstrapAlert('Nothing to display, please load survey first');
                }
                else {
                    bootstrapAlert('Please open "Answers" tab first, to see if everything is correct');
                }
                return;
            }

            if (oldState !== undefined) {
                byId('btn-' + states[oldState]).classList.remove('active');
                byId(states[oldState]).style.display = 'none';
            }
            byId('btn-' + states[state]).classList.add('active');
            byId(states[state]).style.display = 'block';
            oldState = state;

            if (state === 2) {
                if (!answersReady) {
                    if (surveyJustDone) {
                        model.prepareAnswers();
                        model.saveAnswers(this.sId);
                        setMaxState(3);
                        answersReady = true;
                    }
                    else {
                        model.getAnswers(this.sId).success(function () {
                            setMaxState(3);
                            answersReady = true;
                        });
                    }
                }
                else {
                    model.updateShort();
                }
                //todo what happens if we come here again, with changed tags after tags editing?
            }

            if (!chartReady && state === 3) {
                chart.create(model.tags, surveys.surveys[this.sId]);
                var table = new SimpleTable(byId('chart-table'));
                table.create(model.tags);
                chartReady = true;
            }
        };


        function onSurveyLoad (question) {
            answersReady = false;
            that.filterTerm = '';
            trash = [];
            byId('tags-question').innerHTML = question;
            $undo[0].innerHTML = '';
            setMaxState(2);
            that.navigate(1);
        }


        function onSurveyCreated (question) {
            if (question) {
                surveyJustDone = true;
                tagsReady = true;
                that.splitMax();
                onSurveyLoad(question);
            }
        }


        this.loadSurvey = function (id) {
            surveyJustDone = false;
            this.sId = id;
            onSurveyLoad(surveys.surveys[this.sId].question);
            total = +surveys.surveys[id].total;
            model.clearTables();
            model.getTags(id).success(function () {
                that.maxTags = model.tags.length;
                that.minCount = model.tags[that.maxTags - 1][1];
            });
            model.getTerms(id);
        };

        
        this.splitMax = function () {
            if (!this.maxTags) {
                this.maxTags = 1;
            }
            this.minCount = model.splitMax(this.maxTags, tagsReady);
            saveTagTerms();
        };


        this.splitMin = function () {
            this.maxTags = model.splitMin(this.minCount);
            saveTagTerms();
        };


        this.cloneSurvey = function (id) {
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
                            onSurveyCreated(model.initByExcel(workbook));
                        });
                    }
                    else {
                        that.sId = undefined;
                        onSurveyCreated(model.initByExcel(workbook));
                    }
                };

                reader.readAsBinaryString(file);
            }
        };


        function saveTotalTagTerms () {
            model.recalcPerc();
            saveTagTerms();
        }


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
            saveTagTerms();
        };


        this.updateTag = function () {
            model.updateTag.apply(model, arguments);
            saveTagTerms();
        };


        this.deleteRow = function (index, isTagsTable) {
            if (isTagsTable) {
                total -= model.tags[index][1];
                var trashId = trash.push([model.tags[index], isTagsTable]) - 1;
                model.deleteTag(index, trashId);
            }
            else {
                total -= model.terms[index][1];
                trashId = trash.push([model.terms[index], isTagsTable]) - 1;
                model.deleteTerm(index, trashId);
            }
            saveTotalTagTerms();
        };


        this.deleteSyn = function (index, pos) {
            var line = model.deleteSyn(index, pos, trash.length);
            total -= +line[1];
            trash.push([line, index]);
            saveTotalTagTerms();
        };


        this.cloneSyn = function (index, pos) {
            total += model.cloneSyn(index, pos);
            saveTotalTagTerms();
        };


        this.addAnswer = function (indexAnswer, indexTag) {
            model.addAnswer(indexAnswer, indexTag);
            model.patchAnswer(this.sId, indexAnswer);
            chartReady = false;
        };


        this.deleteAnswer = function (indexAnswer, pos) {
            model.deleteAnswer(indexAnswer, pos);
            model.patchAnswer(this.sId, indexAnswer);
            chartReady = false;
        };


        this.undoRow = function (id) {
            var restore = trash[id],
                data = restore[0],
                type = restore[1];

            if (type === true) {
                model.addTag(data);
            }
            else if (type === false) {
                model.addTerm(data);
            }
            else {
                model.addSyn(Math.min(type, model.tags.length - 1), data[0], data[1]);
            }

            total += +data[1];
            saveTotalTagTerms();
        };


        function calcDrop (from, to) {
            var line;
            
            switch (from.tblType) {
                case TBL_tags:
                    if (to.tblType === TBL_tags) {
                        if (from.index !== to.index) {
                            if (to.isRow) {
                                if (!from.isSynonym) {
                                    model.addSyns(from.index, to.index);
                                    model.deleteTag(from.index);
                                }
                                else {
                                    line = model.deleteSyn(from.index, from.synPos);
                                    model.addSyn(to.index, line[0], line[1]);
                                }
                            }
                            else {
                                if (from.isSynonym) {
                                    line = model.deleteSyn(from.index, from.synPos);
                                    model.addTag(line);
                                }
                                else {
                                    return;
                                }
                            }
                        }
                        else {
                            return;
                        }
                    }
                    else {
                        if (!from.isSynonym) {
                            line = model.tags[from.index];
                            if (line[2]) {
                                model.addTerms(line);
                            }
                            model.deleteTag(from.index);
                        }
                        else {
                            line = model.deleteSyn(from.index, from.synPos);
                        }
                        model.addTerm(line);
                    }
                    saveTagTerms();
                    break;

                case TBL_terms:
                    if (to.tblType === TBL_tags) {
                        line = model.terms[from.index];
                        model.deleteTerm(from.index);
                        if (to.isRow) {
                            model.addSyn(to.index, line[0], line[1]);
                        }
                        else {
                            model.addTag(line);
                        }
                    }
                    else {
                        return;
                    }
                    saveTagTerms();
                    break;

                case TBL_short:
                    if (to.tblType === TBL_answers) {
                        that.addAnswer(to.index, from.index);
                    }
                    else {
                        return;
                    }
                    break;
            }
        }


        this.dragTag = function (from, to) {
            var selected = model.getSelected(from.tblType),
                n = selected.length;

            if (n) {
                var newFrom = {
                        tblType: from.tblType,
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
            model.sort(model.terms, true, true);
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

        function saveTagTerms () {
            clearTimeout(saveTimeout);

            saveTimeout = setTimeout(function () {
                if (that.sId && !dupe) {
                    that.surveys[that.sId].total = total;
                    model.overwriteSurvey(that.sId);
                }
                else {
                    dupe = false;
                    model.saveNewSurvey().then(function (surveyId) {
                        that.sId = surveyId;
                        surveys.add(model.surveyId, model.surveyData);
                    });
                }
            }, 600);

            tagsReady = false;
            chartReady = false;
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