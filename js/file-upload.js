(function () {
    'use strict';
    //
    // app.service('TagsService', function ($http) {
    //     this.readTags = function (userToken) {
    //         return $http.get()
    //     }
    // });


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
                        sub: _usrData.sub,
                        tags: tags
                    };

                    $http.post('api/tags.php/test', postData);
                };
                reader.readAsBinaryString(file);
            }
        };

    });
})();