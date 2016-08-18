var total;

app.service('model', ['$http', function ($http) {
    var that = this,
        tagsTable = new Table(byId('tags-table'), TBL_tags),
        termsTable = new Table(byId('terms-table'), TBL_terms),
        answersTable = new Table(byId('answers-table'), TBL_answers),
        shortTable = new Table(byId('short-table'), TBL_short);


    this.initByExcel = function (workbook) {
        var raw = workbook.Sheets["Complete responses"],
            overview = workbook.Sheets.Overview,
            tagsObj = {},
            i = 2,
            row,
            splitter = / and | or | - | but | nor |\/|\.|,|;|:|\?|!|&+/,
            trash = / very | so much | much | many | a | an | the | such | hi | so | lot of | lots of /g,
            space = /  /g;

        while (row = raw['K' + i]) {
            var words = row.w.toLowerCase();

            words = words.split(splitter);
            for (var j in words) {
                var word = (' ' + words[j]).replace(trash, ' ').replace(space, ' ').trim();
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
        var question = overview.C2.w;
        total = +overview.E2.w;

        this.surveyData = {
            survey_google_id: overview.A2.w,
            question: question,
            total: total
        };

        this.tags = [];
        this.answers = [];
        for (i in tagsObj) {
            this.tags.push([i, tagsObj[i]]);
            this.answers.push(i);
        }
        this.answers.sort();
        this.terms = [];

        return question;
    };


    this.getTags = function (surveyId) {
        return $http.get('api/tags.php?surveyId=' + surveyId).success(function (response) {
            that.tags = response;
            tagsTable.draw(response, true);
        });
    };


    this.getTerms = function (surveyId) {
        return $http.get('api/terms.php?surveyId=' + surveyId).success(function (response) {
            that.terms = response;
            termsTable.draw(response);
        });
    };


    this.getAnswers = function (surveyId) {
        return $http.get('api/answers.php?surveyId=' + surveyId).success(function (response) {
            that.answers = response;
            answersTable.draw(response, that.tags);
            shortTable.draw(that.tags);
        });
    };


    this.saveNewSurvey = function () {
        return $http.post('api/surveys.php', {
            survey_google_id: this.surveyData.survey_google_id,
            question: this.surveyData.question,
            tags: packTags(this.tags),
            terms: this.terms,
            total: total
        })
        .then(function (response) {
            return that.surveyId = response.data;
        });
    };


    this.overwriteSurvey = function (surveyId) {
        return $http.put('api/surveys.php', {
            surveyId: surveyId,
            tags: packTags(that.tags),
            terms: this.terms,
            total: total
        });
    };


    this.saveAnswers = function (surveyId) {
        return $http.post('api/answers.php', {
            surveyId: surveyId,
            answers: this.answers
        });
    };

    //
    // this.updateAnswers = function (surveyId) {
    //     return $http.put('api/answers.php', {
    //         surveyId: surveyId,
    //         answers: this.answers
    //     });
    // };


    this.patchAnswer = function (surveyId, answerId) {
        return $http.patch('api/answers.php', {
            surveyId: surveyId,
            answer: this.answers[answerId][0],
            tags: this.answers[answerId][1]
        });
    };


    this.addTag = function (tag) {
        this.tags.unshift(tag);
        tagsTable.addRow(tag);
    };


    this.addTags = function (tags) {
        this.tags = tags.concat(this.tags);
        tagsTable.addRows(tags);
    };


    this.addSyn = function (index, name, count) {
        var line = this.tags[index];
        if (!line[2]) {
            line.push([name]);
            line.push([count]);
        }
        else {
            line[2].unshift(name);
            line[3].unshift(count);
        }
        line[1] += +count;
        tagsTable.addSyn(index, name, line[1]);
    };


    this.addSyns = function (fromIndex, toIndex) {
        var lineFrom = this.tags[fromIndex],
            lineTo = this.tags[toIndex],
            terms = lineFrom[2];

        this.addSyn(toIndex, lineFrom[0], lineFrom[1]);
        if (terms) {
            lineTo[2] = terms.concat(lineTo[2]);
            lineTo[3] = lineFrom[3].concat(lineTo[3]);
            tagsTable.addSyns(toIndex, terms);
        }
    };


    this.addTerm = function (term) {
        this.terms.unshift(term);
        termsTable.addRow(term);
    };


    this.addTerms = function (line) {
        var arr = [],
            sum = 0,
            sub1 = line[2],
            sub2 = line[3];

        for (var i in sub1) {
            sum += +sub2[i];
            arr.push([sub1[i], sub2[i]]);
        }

        line[1] -= sum;

        this.terms = arr.concat(this.terms);
        termsTable.addRows(arr);
    };


    this.deleteTag = function (index, trashId) {
        tagsTable.deleteRow(index, trashId);
        this.tags.splice(index, 1);
    };


    this.deleteSyn = function (index, pos, trashId) {
        var line = this.tags[index],
            terms = line[2],
            counts = line[3],
            result = [terms[pos], counts[pos]];

        terms.splice(pos, 1);
        line[1] -= +counts[pos];
        counts.splice(pos, 1);

        tagsTable.deleteSyn(index, pos, line[1], trashId);
        return result;
    };


    this.cloneSyn = function (index, pos) {
        var line = this.tags[index],
            terms = line[2],
            counts = line[3],
            term = terms[pos],
            count = +counts[pos];

        terms.splice(pos, 0, term);
        counts.splice(pos, 0, count);
        line[1] += count;

        tagsTable.addSyn(index, term, line[1], pos);
        return count;
    };


    this.deleteTerm = function (index, trashId) {
        termsTable.deleteRow(index, trashId);
        this.terms.splice(index, 1);
    };


    this.updateTag = function (isTagsTable, index, pos, name) {
        if (isTagsTable) {
            if (pos) {
                this.tags[index][2][pos] = name;
            }
            else {
                this.tags[index][0] = name;
            }
        }
        else {
            this.terms[index][0] = name;
        }
    };


    this.addAnswer = function (indexAnswer, indexTag) {
        this.answers[indexAnswer][1] += indexTag + ',';
        var tag = this.tags[indexTag];
        answersTable.addSyn(indexAnswer, tag[0]);
        total++;
        shortTable.updateCount(indexTag, ++tag[1]);
        shortTable.updatePerc(this.tags);
    };


    this.deleteAnswer = function (indexAnswer, pos) {
        var arr = this.answers[indexAnswer][1].split(','),
        indexTag = arr.splice(pos, 1);
        this.answers[indexAnswer][1] = arr.join(',') + ',';
        answersTable.deleteSyn(indexAnswer, pos);
        total--;
        shortTable.updateCount(indexTag, --this.tags[indexTag][1]);
        shortTable.updatePerc(this.tags);
    };


    this.prepareAnswers = function () {
        function findSub (haystack, needle) {
            var j,
                i = 0,
                m = needle.length,
                n = haystack.length - m + 1;

            for (; i < n; i++) {
                if (haystack[i] === needle[0]) {
                    j = 1;
                    while (j < m && haystack[i + j] === needle[j]) {
                        j++;
                    }
                    if (j === m) {
                        return true;
                    }
                }
            }
        }

        total = 0;

        var spaceNCommaSplitTrim = /\s*[,\s]+\s*/,
            l = this.tags.length,
            tagWords = Array(l),
            tagSynWords = Array(l);

        for (var j in this.tags) {
            var tag = this.tags[j],
                syn = tag[2];
            tagWords[j] = tag[0].split(spaceNCommaSplitTrim);
            if (syn) {
                var synArr = [];
                for (var k in syn) {
                    synArr.push(syn[k].split(spaceNCommaSplitTrim));
                }
                tagSynWords[j] = synArr;
            }
            tag[1] = 0;
        }

        for (var i in this.answers) {
            var answer = this.answers[i],
                ansWords = answer.split(spaceNCommaSplitTrim),
                tagIds = '';

            for (j in this.tags) {
                tag = this.tags[j];
                if (findSub(ansWords, tagWords[j])) {
                    tagIds += j + ',';
                    tag[1]++;
                    total++;
                    continue;
                }
                syn = tagSynWords[j];
                if (syn) {
                    for (k in syn) {
                        if (findSub(ansWords, syn[k])) {
                            tagIds += j + ',';
                            tag[1]++;
                            total++;
                            break;
                        }
                    }
                }
            }

            this.answers[i] = [answer, tagIds];
        }

        answersTable.draw(this.answers, this.tags);
        shortTable.draw(this.tags);
    };


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

        arr.sort(alpha ? alphabetical : numeric);

        if (toggle) {
            termsTable.draw(this.terms);
            document.getElementsByClassName('pull-xs-right')[0].innerHTML = 'Sort terms ' + (sortOrder === 1 ? '▼' : '▲');
            sortOrder *= -1;
        }

        return arr;
    };


    function packTags () {
        var src = that.tags,
            arr = new Array(that.tags.length);

        for (var i in src) {
            var line = src[i];
            arr[i] = line.slice(0, 2);
            if (line[2]) {
                arr[i].push(line[2].join(','));
                arr[i].push(line[3].join(','));
            }
        }

        return arr;
    }


    function unpackTerms () {
        var terms = that.terms;
        for (var i in terms) {
            if (terms[i][2]) {
                var line = terms[i],
                    name = line[2],
                    count = line[3];

                for (var j in name) {
                    that.terms.push([name[j], count[j]]);
                }
                line.splice(2, 2);
            }
        }
    }


    this.clearTables = function () {
        for (var i in tables) {
            tables[i].clear();
        }
    };


    this.recalcPerc = function () {
        tagsTable.updatePerc(this.tags);
        termsTable.updatePerc(this.terms);
    };


    this.updateShort = function () {
        shortTable.draw(this.tags);
    };


    var tables = [tagsTable, termsTable, answersTable, shortTable];

    this.getSelected = function (tblType) {
        return tables[tblType].selectedIndexes();
    };


    this.splitMax = function (maxTags, tagsReady) {
        var arr = this.tags.concat(this.terms),
            min;

        maxTags = Math.min(maxTags, arr.length);
        this.sort(arr);

        this.tags = arr.slice(0, maxTags);
        this.terms = arr.slice(maxTags);
        min = this.tags[maxTags - 1][1];
        if (!tagsReady) {
            unpackTerms();
        }
        this.sort(this.tags, true);
        this.sort(this.terms, true);

        tagsTable.draw(this.tags, tagsReady);
        termsTable.draw(this.terms);

        return min;
    };


    this.splitMin = function (minCount) {
        var arr = this.tags.concat(this.terms),
            i = 0,
            n = arr.length;

        this.sort(arr);

        while (i < n && arr[i][1] >= minCount) {
            i++;
        }

        this.tags = arr.slice(0, i);
        this.terms = arr.slice(i);
        unpackTerms();
        this.sort(this.tags, true);
        this.sort(this.terms, true);

        tagsTable.draw(this.tags);
        termsTable.draw(this.terms);

        return i;
    };


    this.minTag = function () {
        var min = Infinity,
            count;
        for (var i in this.tags) {
            count = this.tags[i][1];
            if (count < min) {
                min = count;
            }
        }
        return min;
    };


    this.filterTerms = function (word) {
        termsTable.filter(this.terms, word);
    };


    this.logOut = function () {
        return $http.post('api/login.php', {
            logout: xsrfToken
        });
    }

}]);