(function () {
    "use strict";

    angular.module('app').service('model', function ($http) {
        var that = this,
            api = 'api/tags.php';

        //this.surveyId;
        //this.tagsArr;


        this.initByExcel = function (workbook, overwriteSurveyId) {
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
            }
            catch (e) {
                bootstrapAlert('Could not parse answers from Excel file');
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise();
            }

            if (overwriteSurveyId) {
                this.surveyId = overwriteSurveyId;
                this.tagsArr = [];
                return this.appendTags(objToArr(tagsObj));
            }
            else {
                return this.saveNewSurvey(overview.A2.w, overview.C2.w, tagsObj).then(function () {
                    return {
                        survey_google_id: overview.A2.w,
                        question: overview.C2.w
                    }
                });
            }
        };


        this.initBySurveyId = function (surveyId) {
            this.surveyId = surveyId;
            return $http.get(api + '?surveyId=' + surveyId).success(function (response) {
                google.charts.setOnLoadCallback(function () {
                    that.tagsArr = objToArr(response);
                    sortTags();
                });
            });
        };


        this.saveNewSurvey = function (surveyGoogleId, question, tagsObj) {
            this.tagsArr = objToArr(tagsObj);
            sortTags();

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
            this.tagsArr = this.tagsArr.concat(tagsArr);
            sortTags();

            return $http.put(api, {
                surveyId: this.surveyId,
                tagsObj: arrToObj(tagsArr)
            });
        };


        this.updateTag = function (index, name, oldName, count) {
            var tag = this.tagsArr[index];
            if (name) {
                tag[0] = name;
            }
            if (count) {
                tag[1] = count;
                sortTags();
            }
            return $http.patch(api, {
                surveyId: this.surveyId,
                name: tag[0],
                old_name: oldName,
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
                var index = indexes[i] - i;
                tags.push(this.tagsArr[index][0]);
                this.tagsArr.splice(index, 1);
            }

            return $http({  // because by default $http.delete does not send post body
                url: api,
                method: 'DELETE',
                data: {
                    surveyId: this.surveyId,
                    tags: tags
                }
            });
        };


         this.truncateTags = function () {
             return $http.delete(api + '?surveyId=' + this.surveyId);
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


        this.arrToGoo = function (arr) {
            arr.unshift(['', '']);
            var tagsGoo = google.visualization.arrayToDataTable(arr);
            arr.shift();
            return tagsGoo;
        };


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

    });
})();