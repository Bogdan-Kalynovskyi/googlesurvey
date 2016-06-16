(function () {
    'use strict';

    google.charts.load('current', {'packages':['bar']});


    angular.module('app').directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    });


    angular.module('app').controller('UploadCtrl', function ($http) {
        var ctrl = this;
        
        
        this.uploadFile = function (event) {
            var file = event.target.files[0];
            if (file && !file.$error) {
                var reader = new FileReader();
                reader.onload = function (e) {
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
                            for (var j = 0, len = words.length; j < len; j++) {
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
                    }
                    catch (e) {
                        alert('Wrong XLS structure');
                        return;
                    }

                    var postData = {
                        survey_google_id: workbook.Sheets.Overview.A2.w,
                        tags: tags
                    };

                    $http.post('api/tags.php', postData).success(function () {
                    });
                    
                    new Table(postData, {
                        table: document.getElementById('tags-table'),
                        chart: document.getElementById('tags-barchart'),
                        btnDelete: document.getElementById('btn-delete'),
                        btnMerge: document.getElementById('btn-merge')
                    });
                };

                reader.readAsBinaryString(file);
            }
        };

    });
})();