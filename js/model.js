(function () {
    "use strict";

    angular.module('app').service('model', function ($http) {
        var that = this,
            api = 'api/tags.php';
        //this.surveyId;
        //this.tagsArr;
        //this.tagsGoo;

        this.initByExcelData = function (data) {
            try {
                var workbook = XLS.read(data, {type: 'binary'}),
                    raw = workbook.Sheets["Complete responses"],
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
            }
            catch (e) {
                bootstrapAlert('Could not parse Excel file');
                return;
            }
            
            var tmp = workbook.Sheets.Overview;
            return this.saveNewSurvey(tmp.A2.w, tmp.C2.w, tagsObj).then(function () {
                return {
                    survey_google_id: tmp.A2.w,
                    question: tmp.C2.w
                }
            });
        };


        this.initBySurveyId = function (surveyId) {
            this.surveyId = surveyId;
            return $http.get(api + '?surveyGoogleId=' + encodeURIComponent(surveyId)).success(function (response) {
                google.charts.setOnLoadCallback(function () {
                    that.tagsArr = objToArr(response);
                    sortTags();
                    that.tagsGoo = arrToGoo(that.tagsArr);
                });
            });
        };


        this.saveNewSurvey = function (surveyGoogleId, question, tagsObj) {
            this.tagsArr = objToArr(tagsObj);
            sortTags();
            this.tagsGoo = arrToGoo(this.tagsArr);
            
            return $http.post(api, {
                surveyGoogleId: surveyGoogleId,
                question: question,
                tagsObj: tagsObj
            })
            .then(function (response) {
                // TODO: there is a moment when surveyId is undefined!!!!
                return that.surveyId = response.data;
            });
        };


        this.appendTags = function (tagsArr) {
            this.tagsArr.concat(tagsArr);
            sortTags();
            this.tagsGoo = arrToGoo(this.tagsArr);

            return $http.patch(api, {
                surveyId: this.surveyId,
                tagsObj: arrToObj(tagsArr)
            });
        };


        this.updateTag = function (index, name, count) {
            var tag = this.tagsArr[index];
            if (name) {
                tag[0] = name;
                this.tagsGoo.setCell(index, 0, name);
            }
            if (count) {
                tag[1] = count;
                sortTags();
                this.tagsGoo = arrToGoo(this.tagsArr);
            }
            return $http.put(api, {
                surveyId: this.surveyId,
                name: tag[0],
                count: tag[1]
            });
        };


        // this.deleteTag = function (index) {
        //     this.tagsArr.splice(index, 1);
        //     return $http.delete(api, {
        //         tag: this.tagsArr[index][0]
        //     });
        // };


        this.deleteTags = function (indexes) {
            var tags = [];
            
            for (var i = 0, len = indexes.length; i < len; i++) {
                var index = indexes[i];
                this.tagsArr.splice(index, 1);
                this.tagsGoo.removeRow(index);
                tags.push(this.tagsArr[index][0]);
            }

            return $http.delete(api, {
                surveyId: this.surveyId,
                tags: tags
            });
        };


        function objToArr (obj) {
            var arr = [];
            for (var i in obj) {
                arr.push([i, obj[i]]);
            }
            return arr;
        }


        function arrToObj (arr) {
            var newObj = {},
                el;
            for (var i = 0, len = arr.length; i < len; i++) {
                el = arr[i];
                newObj[el[0]] = el[1];
            }
            return newObj;
        }


        function arrToGoo (arr) {
            arr.unshift(['Tag', 'Count']);
            var tagsGoo = google.visualization.arrayToDataTable(arr);
            arr.shift();
            return tagsGoo;
        }


        function sortTags () {
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

            that.tagsArr.sort(compare);
        }


        this.selectedIndexes = function () {
            var selected = [],
                checkboxes = tbody.getElementsByTagName('input');

            for (var i = 0, len = this.tagsArr.length; i < len; i++) {
                if (checkboxes[i].checked) {
                    selected.push(i);
                }
            }
            return selected;
        };
        
    });
})();