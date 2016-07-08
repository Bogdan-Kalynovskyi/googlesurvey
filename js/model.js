(function () {
    "use strict";

    angular.module('app').service('model', function ($http) {
        var that = this,
            api = 'api/tags.php';

        
        this.initByExcel = function (workbook) {
            try {
                var raw = workbook.Sheets["Complete responses"],
                    overview = workbook.Sheets.Overview,
                    tagsObj = {},
                    i = 2,
                    row;

                while (row = raw['K' + i]) {
                    var words = row.w.trim().toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/);
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
                this.sort(this.tagsArr);

                this.surveyData = {
                    survey_google_id: overview.A2.w,
                    question: overview.C2.w
                };
            }
            catch (e) {
                bootstrapAlert('Could not parse answers from Excel file');
            }
        };


        this.getTagsBySurveyId = function (surveyId) {
            return $http.get(api + '?tags&surveyId=' + surveyId).success(function (response) {
                that.tagsArr = response;
            });
        };


        this.getTermsBySurveyId = function (surveyId) {
            return $http.get(api + '?terms&surveyId=' + surveyId).success(function (response) {
                that.termsArr = response;
            });
        };


        function packTags () {
            for (var i = 0, n = that.tagsArr.length; i < n; i++) {
                var line = that.tagsArr[i];
                if (line[2]) {
                    line[2] = line[2].join(',');
                }
            }
        }


        this.saveNewSurvey = function () {
            packTags();
            return $http.post(api, {
                surveyGoogleId: this.surveyData.surveyGoogleId,
                question: this.surveyData.question,
                tagsArr: this.tagsArr,
                termsObj: this.termsArr
            })
            .then(function (response) {
                return that.surveyId = response.data;
            });
        };


        this.overwriteSurvey = function (surveyId) {
            packTags();
            return this.truncateTags().success(function () {
                return $http.put(api, {
                    surveyId: surveyId,
                    tagsArr: that.tagsArr,
                    termsObj: that.termsArr
                });
            });
        };


        this.addTag = function (tag) {
            this.tagsArr.unshift(tag);
            this.tagsTable.addRow(tag);
        };
        

        this.addTags = function (tagsArr) {
            this.tagsArr = tagsArr.concat(this.tagsArr);
            this.tagsTable.addRows(tagsArr);
        };
        
        
        this.addSubTerm = function (index, term) {
            var line = this.tagsArr[index];
            if (!line[2]) {
                line.push([term[0]]);
                line.push([term[1]]);
            }
            else {
                line[2].push(term[0]);
                line[3].push(term[1]);
            }
            this.tagsTable.addSubTerm(index, term);
        };


        this.addTerm = function (term) {
            this.termsArr.unshift(term);
            this.termsTable.addRow(term);
        };


        this.addTerms = function (termsArr) {
            this.termsArr = termsArr.concat(this.termsArr);
            this.termsTable.addRows(termsArr);
        };


        this.deleteTag = function (index) {
            this.tagsArr.splice(index, 1);
            this.tagsTable.deleteRow(index);
        };


        this.deleteSubTerm = function (index, termStr) {
            var line = this.tagsArr[index],
                terms = line[2],
                pos = terms.indexOf(termStr),
                result = [termStr, line[3][pos]];

            terms.splice(pos, 1);
            line[3].splice(pos, 1);

            if (terms.length === 0) {
                line.splice(2, 2);
            }

            this.tagsTable.deleteSubTerm(index, pos);
            return result;
        };


        this.deleteTerm = function (index) {
            this.termsArr.splice(index, 1);
            this.termsTable.deleteRow(index);
        };


        this.updateTag = function (tableId, index, tagName, name, oldName) {
            if (tableId === 'tags-table') {
                if (tagName === 'SPAN') {
                    this.tagsArr[index][0] = name;
                }
                else {
                    var arr = this.tagsArr[index][2];
                    arr[arr.indexOf(oldName)] = name;
                }
            }
            else {
                this.termsArr[index][0] = name;
            }
        };


        this.truncateTags = function () {
            return $http.delete(api + '?surveyId=' + this.surveyId);
        };


        function objToArr (obj) {
            var arr = [];
            for (var i in obj) {
                arr.push([i, obj[i]]);
            }
            
            return that.sort(arr);
        }


        this.strToArr = function (src) {
            var arr = [];

            src[2].forEach(function (el, i) {
                arr.push([el, src[3][i]]);
            });
            return arr;
        };

        
        this.sort = function (arr) {
            function compare(a, b) {
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

            return arr.sort(compare);
        };


        this.splitTags = function (maxTags, minRepeat) {
            var arr = this.tagsArr.concat(this.termsArr),
                i = 0,
                n = arr.length,
                overflow = 0;

            while (i < n && arr[i][1] >= minRepeat) {
                if (!overflow && i > maxTags) {
                    overflow = arr[i][1];
                }
                i++;
            }

            this.tagsArr = arr.slice(0, i);
            this.termsArr = arr.slice(i);
            this.tagsTable.create(this.tagsArr);
            this.termsTable.create(this.termsArr);

            if (overflow) {
                var j = i;
                do {
                    j--;
                } while (j >= 0  && arr[j][1] <= overflow);

                this.tagsTable.makePinkRows(j, i);
                bootstrapAlert('The <b>number of filtered tags</b> is greater then <b>' + maxTags + '</b>, because too many tags have repeat count <b>' + overflow + '</b> and less, so I don\'t know what to do with them. Those tags are marked with stripes.');
            }
        };
        
    });
})();