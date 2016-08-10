var total;

    app.service('model', ['$http', function ($http) {
        var that = this;

        
        this.initByExcel = function (workbook) {
            try {
                var raw = workbook.Sheets["Complete responses"],
                    overview = workbook.Sheets.Overview,
                    tagsObj = {},
                    i = 2,
                    row;

                while (row = raw['K' + i]) {
                    var words = row.w.trim().toLowerCase().split(/ and | or | - | but |\.|,|;|:|\?|!|&+/);
                    for (var j = 0, len = words.length; j < len; j++) {
                        var word = words[j].trim();
                        if (word.length) {
                            if (tagsObj[word]) {
                                tagsObj[word]++;
                            }
                            else {
                                tagsObj[word] = 1;
                            }
                        }
                    }
                    i++;
                }

                this.tagsArr = objToArr(tagsObj);
                this.termsArr = [];
                var question = overview.C2.w,
                    t = +overview.E2.w;

                this.surveyData = {
                    survey_google_id: overview.A2.w,
                    question: question,
                    total: t
                };

                total = t;
            }
            catch (e) {
                bootstrapAlert('Could not parse answers from Excel file');
            }

            return question;
        };


        this.getTagsBySurveyId = function (surveyId) {
            return $http.get('api/tags.php?surveyId=' + surveyId).success(function (response) {
                that.tagsArr = response;
            });
        };


        this.getTermsBySurveyId = function (surveyId) {
            return $http.get('api/terms.php?surveyId=' + surveyId).success(function (response) {
                that.termsArr = response;
            });
        };


        function packTags () {
            var i = 0,
                src = that.tagsArr,
                n = src.length,
                arr = new Array(n);

            for (; i < n; i++) {
                var line = src[i];
                arr[i] = line.slice(0, 2);
                if (line[2]) {
                    arr[i].push(line[2].join(','));
                    arr[i].push(line[3].join(','));
                }
            }

            return arr;
        }


        this.saveNewSurvey = function () {
            return $http.post('api/surveys.php', {
                survey_google_id: this.surveyData.survey_google_id,
                question: this.surveyData.question,
                tagsArr: packTags(this.tagsArr),    // todo: probably pack and unpack will be faster // we also have pack in table for that (for unpacking)
                termsArr: this.termsArr,
                total: total
            })
            .then(function (response) {
                return that.surveyId = response.data;
            });
        };


        this.overwriteSurvey = function (surveyId) {
            return $http.put('api/surveys.php', {
                surveyId: surveyId,
                tagsArr: packTags(that.tagsArr),
                termsArr: this.termsArr,
                total: total
            });
        };


        this.addTag = function (tag) {
            this.tagsArr.unshift(tag);
            this.tagsTable.addRow(tag);
        };
        

        this.addTags = function (tagsArr) {
            total += tagsArr.length;
            this.tagsArr = tagsArr.concat(this.tagsArr);
            this.tagsTable.addRows(tagsArr);
        };
        
        
        this.addSubTerm = function (index, name, repeat) {
            var line = this.tagsArr[index];
            if (!line[2]) {
                line.push([name]);
                line.push([repeat]);
            }
            else {
                line[2].push(name);
                line[3].push(repeat);
            }
            line[1] += +repeat;
            this.tagsTable.addSubTerm(index, name, line[1]);
        };


        this.addSubTerms = function (fromIndex, toIndex) {
            var lineFrom = this.tagsArr[fromIndex],
                lineTo = this.tagsArr[toIndex],
                terms = lineFrom[2];

            this.addSubTerm(toIndex, lineFrom[0], lineFrom[1]);
            if (terms) {
                lineTo[2] = lineTo[2].concat(terms);
                lineTo[3] = lineTo[3].concat(lineFrom[3]);
                this.tagsTable.addSubTerms(toIndex, terms);
            }
        };


        this.addTerm = function (term) {
            this.termsArr.unshift(term);
            this.termsTable.addRow(term);
        };


        this.addTerms = function (line) {
            var arr = [],
                sum = 0,
                sub1 = line[2],
                sub2 = line[3];

            for (var i = 0, n = sub1.length; i < n; i++) {
                sum += +sub2[i];
                arr.push([sub1[i], sub2[i]]);
            }
            
            line[1] -= sum;

            this.termsArr = arr.concat(this.termsArr);
            this.termsTable.addRows(arr);
        };


        this.deleteTag = function (index, trashId) {
            this.tagsTable.deleteRow(index, this.tagsArr[index][0], trashId);
            this.tagsArr.splice(index, 1);
        };


        this.deleteSyn = function (index, name, trashId) {
            var line = this.tagsArr[index],
                terms = line[2],
                pos = terms.indexOf(name),
                result = [name, line[3][pos]];

            terms.splice(pos, 1);
            line[1] -= line[3][pos];
            line[3].splice(pos, 1);

            this.tagsTable.deleteSyn(index, pos, line[1], trashId);
            return result;
        };


        this.duplicateSyn = function (index, name) {
            var line = this.tagsArr[index],
                terms = line[2],
                counts = line[3],
                pos = terms.indexOf(name),
                term = terms[pos],
                count = +counts[pos];

            terms.splice(pos, 0, term);
            line[1] += count;
            counts.splice(pos, 0, count);

            this.tagsTable.addSubTerm(index, term, count); //todo position
            return count;
        };


        this.deleteTerm = function (index, trashId) {
            this.termsTable.deleteRow(index, this.termsArr[index][0], trashId);
            this.termsArr.splice(index, 1);
        };


        this.updateTag = function (isTagsTable, index, isSyn, name, oldName) {
            if (isTagsTable) {
                if (isSyn) {
                    var arr = this.tagsArr[index][2];
                    arr[arr.indexOf(oldName)] = name;
                }
                else {
                    this.tagsArr[index][0] = name;
                }
            }
            else {
                this.termsArr[index][0] = name;
            }
        };


        function objToArr (obj) {
            var arr = [];
            for (var i in obj) {
                arr.push([i, obj[i]]);
            }
            
            return that.sort(arr);
        }

        var sortOrder = 1;
        
        this.sort = function (arr, alpha, toggle) {
            function alphabetical (a, b) {
                if (a[0] > b[0]) {
                    return sortOrder;
                }
                else if (a[0] < b[0]) {
                    return -sortOrder;
                }
                else {
                    return 0;
                }
            }

            function numeric (a, b) {
                if (a[1] > b[1]) {
                    return -1;
                }
                else if (a[1] < b[1]) {
                    return 1;
                }
                else {
                    return 0;
                }
            }

            if (toggle) {
                sortOrder *= -1;

                $('.pull-xs-right').html('Sort terms ' + (sortOrder === 1 ? '▼' : '▲'));
            }

            return arr.sort(alpha ? alphabetical : numeric);
        };


        function unpackTerms () {
            var terms = that.termsArr;
            for (var i = 0, n = terms.length; i < n; i++) {
                if (terms[i][2]) {
                    var line = terms[i],
                        name = line[2],
                        repeat = line[3];

                    for (var j = 0, m = name.length; j < m; j++) {
                        that.termsArr.push([name[j], repeat[j]]);
                    }
                    line.splice(2, 2);
                }
            }
        }


        this.splitMax = function (maxTags, reset) {
            var arr = this.tagsArr.concat(this.termsArr);

            maxTags = Math.min(maxTags, arr.length);
            this.sort(arr);

            this.tagsArr = arr.slice(0, maxTags);
            this.termsArr = arr.slice(maxTags);
            unpackTerms();
            this.sort(this.tagsArr, true);
            this.sort(this.termsArr, true);

            this.tagsTable.create(this.tagsArr, reset);
            this.termsTable.create(this.termsArr, reset);

            return this.tagsArr[maxTags - 1][1];
        };


        this.splitMin = function (minRepeat) {
            var arr = this.tagsArr.concat(this.termsArr),
                i = 0,
                n = arr.length;

            this.sort(arr);

            while (i < n && arr[i][1] >= minRepeat) {
                i++;
            }

            this.tagsArr = arr.slice(0, i);
            this.termsArr = arr.slice(i);
            unpackTerms();
            this.sort(this.tagsArr, true);
            this.sort(this.termsArr, true);

            this.tagsTable.create(this.tagsArr);
            this.termsTable.create(this.termsArr);

            return i;
        };


        this.filterTerms = function (word) {
            this.termsTable.filter(this.termsArr, word);
        };


        this.logOut = function () {
            return $http.post('api/login.php', {
                logout: xsrfToken
            });
        }
        
    }]);