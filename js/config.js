(function () {
    "use strict";

    angular.module('app', ['ui.router', 'ngFileUpload']).config(function ($locationProvider, $sceProvider, $httpProvider) {
        $locationProvider.html5Mode(true);


        //$sceProvider.enabled(false);


        var allowAlert = true,
            ua = navigator.userAgent,
            IEVersion = ua.indexOf("MSIE ");

        if (IEVersion !== -1) {
            IEVersion = parseInt(ua.split('MSIE ')[1]);
        } else if (ua.match(/trident.*rv\:11\./)) {
            IEVersion = 11;
        }
        if (IEVersion !== -1) {
            document.documentElement.className = 'ie' + IEVersion;
            if (IEVersion < 10) {
                alert('You are using Internet Explorer ' + IEVersion + '. Sorry, but we are only supporting Internet Explorer 10 and above. Chrome, Firefox and Safari are also supported.');
            }
        }

        function info (message) {
            if (!document.hidden && allowAlert) {
                alert(message);
                allowAlert = false;
                setTimeout(function () {
                    allowAlert = true;
                }, 20000);
            }
        }

        window.onbeforeunload = function () {
            allowAlert = false;
        };


        $httpProvider.defaults.headers.common.Authorization = xsrf_token;


        $httpProvider.interceptors.push(function ($q, $injector) {
            var retries = 0;

            function retryRequest (httpConfig, status) {
                if (retries < 16) {
                    retries++;
                    var $timeout = $injector.get('$timeout');
                    return $timeout(function () {
                        var $http = $injector.get('$http');
                        return $http(httpConfig);
                    }, retries * 600);
                }
                else if (allowAlert) {
                    if (status === -1) {
                        info('Oops, it seems you have lost internet connection');
                    } else {
                        info('Wow, the server is experiencing overload. Could you please try in a minute?');
                    }
                    // here the code will be blocked with alert, so this line will be executed after alert closes
                    // put timeout back when html popup
                    retries = 0;
                    var reject = $q.defer();
                    reject.reject();
                    return reject.promise;
                }
                else {
                    // We just drop request silently, cause we dont wanna distract user too often
                    // TODO: replace alert with a html popup, and just hide the popup when conection is restored
                }
            }


            return {
                response: function (response) {
                    return response || $q.when(response);
                },

                responseError: function (response) {
                    switch (response.status) {
                        case 401 :
                            alert('Our fuckup! Somebody restarted PHP so your session vanished. Please reload the page to log in again.');
                            break;

                        case -1:
                            // the webapp sometimes aborts network requests. Those that dropped should not be restarted
                            if (response.status === -1 && response.config.timeout) {
                                break;
                            }
                            return retryRequest(response.config, response.status);
                    }
                    // otherwise
                    return $q.reject(response);
                }
            };
        });
    })
})();