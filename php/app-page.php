<!DOCTYPE html>
<html ng-app="app">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <base href="/">
    <meta name="google-signin-client_id" content="211499477101-d78crq8gs6sojr7grdlm9ebmoltiel71.apps.googleusercontent.com">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
    <script src="../node_modules/angular/angular.js"></script>
<!--    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js"></script>-->
    <script src="../node_modules/angular-ui-router/release/angular-ui-router.js"></script>
<!--    <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.3.1/angular-ui-router.min.js"></script>-->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <!--    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>-->
    <script src="node_modules/ng-file-upload/dist/ng-file-upload.js"></script>
    <script src="node_modules/xlsjs/dist/xls.js"></script>
    <script>
        xsrf_token = '<?php echo $_SESSION['xsrf_token'] ?>';
    </script>
    <script src="js/config.js"></script>
    <script src="js/file-upload.js"></script>
    <script src="js/routing.js"></script>
</head>

<body>
    <header>
        <a href="#" onclick="signOut();return false;">Sign out</a>
        <script>
            function signOut() {
                var form = $('<form action=/ method=post><input type=hidden name=logout value=' + xsrf_token + '></form>');
                $(document.body).append(form);
                form.submit();
            }
        </script>
    </header>

    <div ui-view></div>

    <footer></footer>
</body>
</html>