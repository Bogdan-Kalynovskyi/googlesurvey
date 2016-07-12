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
            var arr = that.packedTags = that.tagsArr.concat();
            for (var i = 0, n = arr.length; i < n; i++) {
                var line = arr[i];
                if (line[2]) {
                    line[2] = line[2].join(',');
                    line[3] = line[3].join(',');
                }
            }
            return arr;
        }


        this.saveNewSurvey = function () {
            packTags();
            return $http.post(api, {
                survey_google_id: this.surveyData.survey_google_id,
                question: this.surveyData.question,
                tagsArr: this.packedTags,    // todo: probably pack and unpack will be faster // we also have pack in table for that (for unpacking)
                termsArr: this.termsArr
            })
            .then(function (response) {
                return that.surveyId = response.data;
            });
        };


        this.overwriteSurvey = function (surveyId) {
            packTags();
            return $http.delete(api + '?surveyId=' + surveyId).success(function () {
                return $http.put(api, {
                    surveyId: surveyId,
                    tagsArr: that.packedTags,
                    termsArr: that.termsArr
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
                lineTo[2].concat(terms);
                lineTo[3].concat(lineFrom[3]);
                this.tagsTable.addSubTerms(index, terms);
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
                sum += sub2[i]; 
                arr.push([sub1[i], sub2[i]]);
            }
            
            line[1] -= sum;

            this.termsArr = arr.concat(this.termsArr);
            this.termsTable.addRows(arr);
        };


        this.deleteTag = function (index) {
            this.tagsArr.splice(index, 1);
            this.tagsTable.deleteRow(index);
        };


        this.deleteSubTerm = function (index, name) {
            var line = this.tagsArr[index],
                terms = line[2],
                pos = terms.indexOf(name),
                result = [name, line[3][pos]];

            terms.splice(pos, 1);
            line[1] -= line[3][pos];
            line[3].splice(pos, 1);

            this.tagsTable.deleteSubTerm(index, pos, line[1]);
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


        function objToArr (obj) {
            var arr = [];
            for (var i in obj) {
                arr.push([i, obj[i]]);
            }
            
            return that.sort(arr);
        }

        
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

                this.tagsTable.makeStripedRows(j, i);
                bootstrapAlert('The <b>number of filtered tags</b> is greater then <b>' + maxTags + '</b>, because too many tags have repeat count <b>' + overflow + '</b> and less, so I don\'t know what to do with them. Those tags are marked with stripes.');
            }
        };
        
    });
})();