    var trash,
        TBL_tags = 0,
        TBL_terms = 1,
        TBL_answers = 2,
        TBL_short = 3;

    function byId(id) {
        return document.getElementById(id);
    }

    function byQs(id) {
        return document.querySelector(id);
    }


    app.controller('dashboard', ['model', 'surveys', '$rootScope', '$q', function (model, surveys, $rootScope, $q) {

        var that = this,
            dupe = false,
            chart = new Chart(byId('tags-chart')),
            states = ['surveys', 'tags', 'answers', 'chart'],
            maxState = 0,
            oldState,

            tagsReady,
            answersNeedScan,
            answersNeedLoad,
            answersReady,
            chartReady;


        surveys.load().success(function () {
            angular.element(byId('loading')).remove();
            that.navigate(0);
            that.surveys = surveys.surveys;
        });


        window.addEventListener('resize', function () {
            if (oldState === 3) {
                chart.resize();
            }
        });


        function setMaxState (state) {
            maxState = state;
            for (state = 1; state < states.length; state++) {
                var btn = byId('btn-' + states[state]).classList;
                if (state > maxState) {
                    btn.add('disabled');
                }
                else {
                    btn.remove('disabled');
                }
            }
        }


        this.navigate = function (state) {
            if (state > maxState) {
                bootstrapAlert('Nothing to display, please load survey first');
                return;
            }

            if (oldState !== undefined) {
                byId('btn-' + states[oldState]).classList.remove('active');
                byId(states[oldState]).style.display = 'none';
            }
            byId('btn-' + states[state]).classList.add('active');
            byId(states[state]).style.display = 'block';
            oldState = state;

            if (state === 1 && !tagsReady) {
                model.updateTagsTbl();
                tagsReady = true;
            }

            if (state === 2 && !answersReady) {
                if (answersNeedScan) {
                    model.prepareAnswers(this.sId);
                    model.updateAnsTbl();
                    answersNeedScan = false;
                }
                else if (answersNeedLoad) {
                    model.getAnswers(that.sId).success(function () {
                        model.updateAnsTbl();
                    });
                    answersNeedLoad = false;
                }
                else {
                    model.updateAnsTbl();
                }
                answersReady = true;
                model.updateShort();
            }

            if (state === 3 && !chartReady) {
                if (answersNeedScan) {
                    model.prepareAnswers(this.sId);
                    answersNeedScan = false;
                }
                var table = new SimpleTable(byId('chart-table'));
                table.create(model.tags);
                chart.create(model.tags, surveys.surveys[this.sId]);
                chartReady = true;
            }
        };


        function navigateTagsTab (question) {
            tagsReady = true;
            answersReady = false;
            answersNeedScan = false;
            chartReady = false;
            that.filterTerm = '';
            trash = [];
            undo.innerHTML = '';
            byId('tags-question').innerHTML = question;
            that.navigate(1);
        }


        function onSurveyCreated (newSurvey) {
            answersNeedLoad = false;
            that.maxTags = 20;
            that.minCount = newSurvey.split;
            saveTagTerms(newSurvey);
            setMaxState(3);
            navigateTagsTab(newSurvey.question);
        }


        this.loadSurvey = function (id) {
            answersNeedLoad = true;
            this.sId = id;
            total = +surveys.surveys[id].total;
            model.clearTables();
            setMaxState(1);
            navigateTagsTab(surveys.surveys[this.sId].question);
            var q1 = model.getTags(id).success(function () {
                    that.maxTags = model.tags.length;
                    that.minCount = model.minTag();
                }),
                q2 = model.getTerms(id),
                q3 = model.getAnswers(this.sId);

            $q.all([q1, q3]).then(function () {
                setMaxState(3);
            });

            var q4 = $q.all([q1, q2]).then(function () {
                if (dupe) {
                    return saveTagTerms(surveys.surveys[that.sId], true);
                }
            });

            if (dupe) {
                $q.all([q3, q4]).then(function () {
                    model.saveAnswers(that.sId);
                    dupe = false;
                });
            }
        };

        
        this.splitMax = function () {
            if (!this.maxTags) {
                this.maxTags = 1;
            }
            this.minCount = model.splitMax(this.maxTags);
            saveTagTerms();
        };


        this.splitMin = function () {
            this.maxTags = model.splitMin(this.minCount);
            saveTagTerms();
        };


        this.cloneSurvey = function (surveyId) {
            dupe = true;
            this.loadSurvey(surveyId);
        };


        this.hasSurveys = function () {
            return surveys.notEmpty();
        };


        this.uploadFile = function (event) {
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var workbook = XLS.read(e.target.result, {type: 'binary'}),
                        overview = workbook.Sheets.Overview,
                        surveyId = surveys.findByGoogleId(overview.A2.w),
                        msg = 'This survey has already been uploaded. Do you want to overwrite existing one or add as a new survey?';

                    if (surveyId !== -1) {
                        bootstrapConfirm(msg, 'Add as new', 'Overwrite', function (add) {
                            if (add) {
                                that.sId = undefined;
                            }
                            else {
                                that.sId = surveyId;
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
            tagsReady = false;
            chartReady = false;
            saveTagTerms(false, true);
        };


        this.deleteAnswer = function (indexAnswer, pos) {
            model.deleteAnswer(indexAnswer, pos);
            model.patchAnswer(this.sId, indexAnswer);
            tagsReady = false;
            chartReady = false;
            saveTagTerms(false, true);
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

        function saveTagTerms (newSurvey, noScan) {
            clearTimeout(saveTimeout);

            if (newSurvey) {
                return model.saveNewSurvey(newSurvey).success(function (surveyId) {
                    that.sId = surveyId;
                    if (!noScan) {
                        model.saveAnswers(surveyId);
                    }
                    surveys.add(surveyId, newSurvey);
                });
            }
            else {
                saveTimeout = setTimeout(function () {
                    that.surveys[that.sId].total = total;
                    model.overwriteSurvey(that.sId);
                }, 500);
            }

            // don't touch those below when only terms changed
            tagsReady = true;
            chartReady = false;
            answersReady = false;
            if (!noScan) {
                answersNeedScan = true;
            }
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
                    var csvWin = window.open('', '', '');// todo this is not tested and possibly only needed for legacy browsers
                    csvWin.document.write('<meta name=content-type content=text/csv><meta name=content-disposition content="attachment;  filename=' + fileName + '">  ');
                    csvWin.document.write(chart.csvStr);
                }
            }
        };


        this.deleteSurveyById = function (id) {
            bootstrapConfirm('Do you really want to delete this survey and all its data?', 'Delete', 'Cancel', function (yes) {
                if (yes) {
                    surveys.delete(id);
                    if (id === that.sId) {
                        setMaxState(0);
                    }
                }
            });
        };


        this.logOut = function () {
            $q.all([model.logOut(), gapi.auth2.getAuthInstance().signOut()]).then(function () {
                location.reload();
            });
        }
    }]);