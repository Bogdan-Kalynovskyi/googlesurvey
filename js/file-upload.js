(function () {
    'use strict';

    google.charts.load('current', {'packages':['table', 'bar']});


    angular.module('app').directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    });


    angular.module('app').controller('UploadCtrl', function ($scope, $http) {
        $scope.uploadFile = function (event){
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;

                    try {
                        var workbook = XLS.read(data, {type: 'binary'}),
                            raw = workbook.Sheets["Complete responses"],
                            tags = {},
                            i = 2,
                            row,
                            words,
                            word;

                        while (row = raw['K' + i]) {
                            words = row.w.trim().toLowerCase().split(/ and | or |\.|,|;|:|\?|!|&+/);
                            for (var j = 0, wl = words.length; j < wl; j++) {
                                word = words[j].trim();
                                if (word.length) {
                                    if (tags[word]) {
                                        tags[word]++;
                                    }
                                    else {
                                        tags[word] = 1;
                                    }
                                }
                            }
                            i++;
                        }

                        var postData = {
                            survey_google_id: workbook.Sheets.Overview.A2.w,
                            tags: tags
                        };
                    }
                    catch (e) {
                        alert('Wrong XLS structure');
                    }

                    reader.drawTable(postData);

                    $http.post('api/tags.php', postData).success(function () {
                    });
                };
                
                reader.readAsBinaryString(file);


                reader.drawTable = function (postData) {
                    var tags = postData.tags,
                        tagsArray = [];

                    for (var i in tags) {
                        tagsArray.push([i, tags[i]]);
                    }

                    function sortFunction (a, b) {
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

                    tagsArray.sort(sortFunction);

                    google.charts.setOnLoadCallback(drawTable);
                    google.charts.setOnLoadCallback(drawChart);


                    function drawTable () {
                        var data = new google.visualization.DataTable();

                        data.addColumn('string', 'Tag');
                        data.addColumn('number', 'Count');

                        data.addRows(tagsArray);

                        var table = new google.visualization.Table($('#table_div')[0]);

                        table.draw(data, {showRowNumber: false, width: '100%', height: '100%'});
                    }

                    function drawChart() {
                        tagsArray.unshift(['Tag', 'Count']);
                        var data = google.visualization.arrayToDataTable(tagsArray);

                        var options = {
                            chart: {
                                title: 'What\'s the first thing that comes to your mind when you think of Adelaide?',
                                subtitle: 'Results for Survey ID: ' + postData.survey_google_id
                            },
                            bars: 'horizontal' // Required for Material Bar Charts.
                        };

                        var container = $('#barchart_material').height(18 * tagsArray.length),
                            chart = new google.charts.Bar(container[0]);

                        chart.draw(data, options);
                    }
                }
            }
        };

    });
})();